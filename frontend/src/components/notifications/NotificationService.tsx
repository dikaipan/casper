'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import api from '@/lib/api';

// This component handles notification polling and sound alerts
export default function NotificationService() {
  const { user, isAuthenticated } = useAuthStore();
  const { updateTicketStatus, addNotification } = useNotificationStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    let userInteracted = false;
    
    // Mark user interaction to enable audio
    const enableAudio = () => {
      userInteracted = true;
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
    };
    
    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true });
    });
    
    // Create audio context after user interaction
    const getAudioContext = async () => {
      if (!audioContext) {
        try {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
          console.warn('Could not create AudioContext:', error);
          return null;
        }
      }
      
      // Resume if suspended (required after user interaction)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (error) {
          console.warn('Could not resume AudioContext:', error);
        }
      }
      
      return audioContext;
    };
    
    // Helper function to play a tone
    const playTone = (ctx: AudioContext) => {
      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800; // 800 Hz tone
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
      } catch (error) {
        console.warn('Could not play tone:', error);
      }
    };
    
    // Simple beep sound using Web Audio API
    const playBeepSound = async () => {
      try {
        const ctx = await getAudioContext();
        if (ctx) {
          playTone(ctx);
        } else {
          // Fallback: create new context
          playFallbackSound();
        }
      } catch (error) {
        console.warn('Could not play beep sound:', error);
        playFallbackSound();
      }
    };
    
    // Fallback sound using Web Audio API directly
    const playFallbackSound = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume if suspended
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            playTone(ctx);
          }).catch(() => {
            // If resume fails, try anyway
            playTone(ctx);
          });
        } else {
          playTone(ctx);
        }
      } catch (error) {
        console.warn('Could not create AudioContext for fallback:', error);
      }
    };
    
    // Store function reference
    (audioRef as any).current = playBeepSound;
    
    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, enableAudio);
      });
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const playSound = (audioRef as any).current;
      if (playSound && typeof playSound === 'function') {
        // Call the function and handle any errors
        const result = playSound();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.warn('Error playing notification sound:', error);
          });
        }
      } else {
        console.warn('Notification sound function not available');
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Get status label in Indonesian
  const getStatusLabel = useCallback((status: string) => {
    const labels: Record<string, string> = {
      OPEN: 'Open',
      IN_DELIVERY: 'Dikirim ke RC',
      RECEIVED: 'Diterima di RC',
      IN_PROGRESS: 'Sedang Diperbaiki',
      RESOLVED: 'Selesai Diperbaiki',
      RETURN_SHIPPED: 'Dikirim ke Pengelola',
      CLOSED: 'Selesai',
    };
    return labels[status] || status;
  }, []);

  // Poll for ticket updates
  const pollTickets = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Use pagination to reduce payload size - only fetch first page with minimal limit
      const response = await api.get('/tickets', {
        params: {
          page: 1,
          limit: 50, // Only check first 50 tickets for status changes
        },
      });
      // Handle both old format (array) and new format (object with data & pagination)
      const tickets = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);

      // Check each ticket for status changes
      tickets.forEach((ticket: any) => {
        // Get last status BEFORE updating
        const state = useNotificationStore.getState();
        const lastStatus = state.lastCheckedTickets[ticket.id];
        const currentStatus = ticket.status;
        
        // Only create notification if status actually changed (not first time tracking)
        if (lastStatus && lastStatus !== currentStatus) {
          // Status has changed! Create notification and play sound
          const oldStatusLabel = getStatusLabel(lastStatus);
          const newStatusLabel = getStatusLabel(currentStatus);
          
          addNotification({
            type: 'SO_STATUS_CHANGE',
            title: `Status Service Order Berubah`,
            message: `Service Order ${ticket.ticketNumber} telah berubah dari ${oldStatusLabel} menjadi ${newStatusLabel}`,
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            oldStatus: oldStatusLabel,
            newStatus: newStatusLabel,
          });

          // Play sound when notification is created
          setTimeout(() => {
            playNotificationSound();
          }, 100); // Small delay to ensure notification is added first
        }
        
        // Update the last checked status (always update, even if no change)
        updateTicketStatus(ticket.id, currentStatus);
      });
    } catch (error: any) {
      // Handle rate limiting errors
      if (error.response?.status === 429) {
        console.warn('Rate limit reached. Polling will resume after delay.');
        // Stop polling temporarily - will resume on next mount or manual refresh
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        // Resume after 2 minutes
        setTimeout(() => {
          if (isAuthenticated && user) {
            pollingIntervalRef.current = setInterval(pollTickets, 120000); // Poll every 2 minutes after rate limit
          }
        }, 120000);
      } else {
        console.error('Error polling tickets:', error);
      }
    }
  }, [isAuthenticated, user, updateTicketStatus, addNotification, getStatusLabel, playNotificationSound]);

  // Set up polling interval
  useEffect(() => {
    if (!isAuthenticated) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Initial poll (with delay to avoid immediate rate limit)
    const initialDelay = setTimeout(() => {
      pollTickets();
    }, 5000); // Wait 5 seconds before first poll

    // Poll every 60 seconds (reduced frequency to avoid rate limits)
    // This means max 1 request per minute, well under the 10/minute limit
    pollingIntervalRef.current = setInterval(pollTickets, 60000);

    return () => {
      clearTimeout(initialDelay);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, pollTickets]);

  // This component doesn't render anything
  return null;
}

