-- CreateTable
CREATE TABLE `customers_banks` (
    `id` CHAR(36) NOT NULL,
    `bank_code` VARCHAR(20) NOT NULL,
    `bank_name` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `primary_contact_name` VARCHAR(255) NULL,
    `primary_contact_email` VARCHAR(255) NULL,
    `primary_contact_phone` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_banks_bank_code_key`(`bank_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengelola` (
    `id` CHAR(36) NOT NULL,
    `pengelola_code` VARCHAR(50) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `company_abbreviation` VARCHAR(50) NOT NULL,
    `business_registration_number` VARCHAR(100) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `primary_contact_name` VARCHAR(255) NULL,
    `primary_contact_email` VARCHAR(255) NULL,
    `primary_contact_phone` VARCHAR(50) NULL,
    `website` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pengelola_pengelola_code_key`(`pengelola_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_pengelola_assignments` (
    `id` CHAR(36) NOT NULL,
    `customer_bank_id` CHAR(36) NOT NULL,
    `pengelola_id` CHAR(36) NOT NULL,
    `contract_number` VARCHAR(100) NULL,
    `contract_start_date` DATE NULL,
    `contract_end_date` DATE NULL,
    `service_scope` VARCHAR(191) NULL,
    `assigned_branches` JSON NULL,
    `sla_response_time_hours` INTEGER NULL,
    `sla_resolution_time_hours` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bank_pengelola_assignments_customer_bank_id_pengelola_id_key`(`customer_bank_id`, `pengelola_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengelola_users` (
    `id` CHAR(36) NOT NULL,
    `pengelola_id` CHAR(36) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `whatsapp_number` VARCHAR(50) NULL,
    `role` ENUM('TECHNICIAN', 'SUPERVISOR', 'ADMIN') NOT NULL DEFAULT 'TECHNICIAN',
    `employee_id` VARCHAR(100) NULL,
    `can_create_tickets` BOOLEAN NOT NULL DEFAULT true,
    `can_close_tickets` BOOLEAN NOT NULL DEFAULT false,
    `can_manage_machines` BOOLEAN NOT NULL DEFAULT false,
    `assigned_branches` JSON NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `last_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pengelola_users_username_key`(`username`),
    UNIQUE INDEX `pengelola_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hitachi_users` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'RC_MANAGER', 'RC_STAFF') NOT NULL DEFAULT 'RC_STAFF',
    `department` ENUM('MANAGEMENT', 'REPAIR_CENTER', 'LOGISTICS') NOT NULL DEFAULT 'REPAIR_CENTER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `last_login` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hitachi_users_username_key`(`username`),
    UNIQUE INDEX `hitachi_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `machines` (
    `id` CHAR(36) NOT NULL,
    `customer_bank_id` CHAR(36) NOT NULL,
    `pengelola_id` CHAR(36) NOT NULL,
    `machine_code` VARCHAR(100) NOT NULL,
    `model_name` VARCHAR(255) NOT NULL,
    `serial_number_manufacturer` VARCHAR(255) NOT NULL,
    `physical_location` VARCHAR(191) NOT NULL,
    `branch_code` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `province` VARCHAR(100) NULL,
    `installation_date` DATE NULL,
    `current_wsid` VARCHAR(100) NULL,
    `status` ENUM('OPERATIONAL', 'MAINTENANCE', 'DECOMMISSIONED', 'UNDER_REPAIR') NOT NULL DEFAULT 'OPERATIONAL',
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `machines_machine_code_key`(`machine_code`),
    INDEX `machines_customer_bank_id_idx`(`customer_bank_id`),
    INDEX `machines_pengelola_id_idx`(`pengelola_id`),
    INDEX `machines_status_idx`(`status`),
    INDEX `machines_branch_code_idx`(`branch_code`),
    INDEX `machines_customer_bank_id_status_idx`(`customer_bank_id`, `status`),
    INDEX `machines_pengelola_id_status_idx`(`pengelola_id`, `status`),
    INDEX `machines_created_at_idx`(`created_at`),
    INDEX `machines_serial_number_manufacturer_idx`(`serial_number_manufacturer`),
    INDEX `machines_machine_code_idx`(`machine_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `machine_identifier_history` (
    `id` CHAR(36) NOT NULL,
    `machine_id` CHAR(36) NOT NULL,
    `identifier_type` ENUM('WSID', 'SERIAL_NUMBER', 'BRANCH_CODE', 'PENGELOLA_ASSIGNMENT') NOT NULL,
    `old_value` VARCHAR(255) NULL,
    `new_value` VARCHAR(255) NOT NULL,
    `change_reason` VARCHAR(191) NULL,
    `changed_by` VARCHAR(255) NOT NULL,
    `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cassette_types` (
    `id` CHAR(36) NOT NULL,
    `type_code` ENUM('RB', 'AB', 'URJB') NOT NULL,
    `machine_type` VARCHAR(100) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cassette_types_type_code_key`(`type_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cassettes` (
    `id` CHAR(36) NOT NULL,
    `serial_number` VARCHAR(100) NOT NULL,
    `cassette_type_id` CHAR(36) NOT NULL,
    `customer_bank_id` CHAR(36) NOT NULL,
    `status` ENUM('OK', 'BAD', 'IN_TRANSIT_TO_RC', 'IN_REPAIR', 'IN_TRANSIT_TO_PENGELOLA', 'SCRAPPED') NOT NULL DEFAULT 'OK',
    `usage_type` ENUM('MAIN', 'BACKUP') NULL,
    `machine_id` CHAR(36) NULL,
    `notes` VARCHAR(191) NULL,
    `replaced_cassette_id` CHAR(36) NULL,
    `replacement_ticket_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cassettes_serial_number_key`(`serial_number`),
    INDEX `cassettes_customer_bank_id_idx`(`customer_bank_id`),
    INDEX `cassettes_machine_id_idx`(`machine_id`),
    INDEX `cassettes_status_idx`(`status`),
    INDEX `cassettes_cassette_type_id_idx`(`cassette_type_id`),
    INDEX `cassettes_customer_bank_id_status_idx`(`customer_bank_id`, `status`),
    INDEX `cassettes_machine_id_status_idx`(`machine_id`, `status`),
    INDEX `cassettes_created_at_idx`(`created_at`),
    INDEX `cassettes_replaced_cassette_id_idx`(`replaced_cassette_id`),
    INDEX `cassettes_replacement_ticket_id_idx`(`replacement_ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repair_tickets` (
    `id` CHAR(36) NOT NULL,
    `cassette_id` CHAR(36) NOT NULL,
    `reported_issue` VARCHAR(191) NOT NULL,
    `received_at_rc` DATETIME(3) NOT NULL,
    `repaired_by` CHAR(36) NULL,
    `repair_action_taken` VARCHAR(191) NULL,
    `parts_replaced` JSON NULL,
    `qc_passed` BOOLEAN NULL,
    `completed_at` DATETIME(3) NULL,
    `status` ENUM('RECEIVED', 'DIAGNOSING', 'ON_PROGRESS', 'COMPLETED', 'SCRAPPED') NOT NULL DEFAULT 'RECEIVED',
    `type` ENUM('ROUTINE', 'ON_DEMAND_PENGELOLA', 'ON_DEMAND_HITACHI', 'EMERGENCY') NOT NULL DEFAULT 'ROUTINE',
    `notes` VARCHAR(191) NULL,
    `warranty_type` ENUM('MA', 'MS', 'IN_WARRANTY', 'OUT_WARRANTY') NULL,
    `warranty_period_days` INTEGER NULL,
    `warranty_start_date` DATETIME(3) NULL,
    `warranty_end_date` DATETIME(3) NULL,
    `warranty_claimed` BOOLEAN NOT NULL DEFAULT false,
    `warranty_claim_count` INTEGER NOT NULL DEFAULT 0,
    `is_warranty_repair` BOOLEAN NOT NULL DEFAULT false,
    `original_repair_id` CHAR(36) NULL,
    `warranty_claim_reason` VARCHAR(191) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `repair_tickets_cassette_id_status_idx`(`cassette_id`, `status`),
    INDEX `repair_tickets_received_at_rc_idx`(`received_at_rc`),
    INDEX `repair_tickets_status_idx`(`status`),
    INDEX `repair_tickets_repaired_by_idx`(`repaired_by`),
    INDEX `repair_tickets_qc_passed_idx`(`qc_passed`),
    INDEX `repair_tickets_completed_at_idx`(`completed_at`),
    INDEX `repair_tickets_created_at_idx`(`created_at`),
    INDEX `repair_tickets_status_received_at_rc_idx`(`status`, `received_at_rc`),
    INDEX `repair_tickets_warranty_type_idx`(`warranty_type`),
    INDEX `repair_tickets_warranty_end_date_idx`(`warranty_end_date`),
    INDEX `repair_tickets_is_warranty_repair_idx`(`is_warranty_repair`),
    INDEX `repair_tickets_original_repair_id_idx`(`original_repair_id`),
    INDEX `repair_tickets_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problem_tickets` (
    `id` CHAR(36) NOT NULL,
    `ticket_number` VARCHAR(50) NOT NULL,
    `cassette_id` CHAR(36) NULL,
    `machine_id` CHAR(36) NULL,
    `reported_by` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'IN_DELIVERY', 'RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'RETURN_SHIPPED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `affected_components` JSON NULL,
    `resolution_notes` VARCHAR(191) NULL,
    `wsid` VARCHAR(100) NULL,
    `error_code` VARCHAR(50) NULL,
    `delivery_method` VARCHAR(50) NULL,
    `courier_service` VARCHAR(255) NULL,
    `tracking_number` VARCHAR(100) NULL,
    `reported_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,
    `closed_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `problem_tickets_ticket_number_key`(`ticket_number`),
    INDEX `problem_tickets_cassette_id_status_idx`(`cassette_id`, `status`),
    INDEX `problem_tickets_machine_id_status_idx`(`machine_id`, `status`),
    INDEX `problem_tickets_reported_by_idx`(`reported_by`),
    INDEX `problem_tickets_created_at_idx`(`created_at`),
    INDEX `problem_tickets_status_idx`(`status`),
    INDEX `problem_tickets_reported_at_idx`(`reported_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_cassette_details` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `cassette_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `affected_components` JSON NULL,
    `wsid` VARCHAR(100) NULL,
    `error_code` VARCHAR(50) NULL,
    `request_replacement` BOOLEAN NOT NULL DEFAULT false,
    `replacement_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ticket_cassette_details_cassette_id_idx`(`cassette_id`),
    UNIQUE INDEX `ticket_cassette_details_ticket_id_cassette_id_key`(`ticket_id`, `cassette_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cassette_deliveries` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `cassette_id` CHAR(36) NOT NULL,
    `sent_by` CHAR(36) NOT NULL,
    `shipped_date` DATETIME(3) NOT NULL,
    `courier_service` VARCHAR(255) NULL,
    `tracking_number` VARCHAR(100) NULL,
    `estimated_arrival` DATETIME(3) NULL,
    `received_at_rc` DATETIME(3) NULL,
    `received_by` CHAR(36) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `sender_address` VARCHAR(191) NULL,
    `sender_city` VARCHAR(100) NULL,
    `sender_contact_name` VARCHAR(255) NULL,
    `sender_contact_phone` VARCHAR(50) NULL,
    `sender_postal_code` VARCHAR(20) NULL,
    `sender_province` VARCHAR(100) NULL,
    `use_office_address` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `cassette_deliveries_ticket_id_key`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cassette_returns` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `cassette_id` CHAR(36) NOT NULL,
    `sent_by` CHAR(36) NOT NULL,
    `shipped_date` DATETIME(3) NOT NULL,
    `courier_service` VARCHAR(255) NULL,
    `tracking_number` VARCHAR(100) NULL,
    `estimated_arrival` DATETIME(3) NULL,
    `received_at_pengelola` DATETIME(3) NULL,
    `received_by` CHAR(36) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cassette_returns_ticket_id_key`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `preventive_maintenances` (
    `id` CHAR(36) NOT NULL,
    `pm_number` VARCHAR(50) NOT NULL,
    `type` ENUM('ROUTINE', 'ON_DEMAND_PENGELOLA', 'ON_DEMAND_HITACHI', 'EMERGENCY') NOT NULL DEFAULT 'ROUTINE',
    `location` ENUM('BANK_LOCATION', 'PENGELOLA_LOCATION', 'REPAIR_CENTER') NOT NULL DEFAULT 'PENGELOLA_LOCATION',
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
    `scheduled_date` DATETIME(3) NOT NULL,
    `scheduled_time` VARCHAR(10) NULL,
    `actual_start_date` DATETIME(3) NULL,
    `actual_end_date` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `checklist` JSON NULL,
    `findings` VARCHAR(191) NULL,
    `actions_taken` VARCHAR(191) NULL,
    `parts_replaced` JSON NULL,
    `recommendations` VARCHAR(191) NULL,
    `next_pm_date` DATETIME(3) NULL,
    `next_pm_interval` INTEGER NULL,
    `assigned_engineer` CHAR(36) NULL,
    `requested_by_pengelola` CHAR(36) NULL,
    `requested_by_hitachi` CHAR(36) NULL,
    `requested_by_type` VARCHAR(20) NULL,
    `contact_name` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `location_address` VARCHAR(191) NULL,
    `location_city` VARCHAR(100) NULL,
    `location_province` VARCHAR(100) NULL,
    `location_postal_code` VARCHAR(20) NULL,
    `notes` VARCHAR(191) NULL,
    `cancelled_reason` VARCHAR(191) NULL,
    `cancelled_by` CHAR(36) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `completed_by` CHAR(36) NULL,
    `completed_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `preventive_maintenances_pm_number_key`(`pm_number`),
    INDEX `preventive_maintenances_status_idx`(`status`),
    INDEX `preventive_maintenances_scheduled_date_idx`(`scheduled_date`),
    INDEX `preventive_maintenances_assigned_engineer_idx`(`assigned_engineer`),
    INDEX `preventive_maintenances_requested_by_pengelola_idx`(`requested_by_pengelola`),
    INDEX `preventive_maintenances_requested_by_hitachi_idx`(`requested_by_hitachi`),
    INDEX `preventive_maintenances_type_idx`(`type`),
    INDEX `preventive_maintenances_location_idx`(`location`),
    INDEX `preventive_maintenances_status_scheduled_date_idx`(`status`, `scheduled_date`),
    INDEX `preventive_maintenances_created_at_idx`(`created_at`),
    INDEX `preventive_maintenances_pm_number_idx`(`pm_number`),
    INDEX `preventive_maintenances_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pm_cassette_details` (
    `id` CHAR(36) NOT NULL,
    `pm_id` CHAR(36) NOT NULL,
    `cassette_id` CHAR(36) NOT NULL,
    `checklist` JSON NULL,
    `findings` VARCHAR(191) NULL,
    `actions_taken` VARCHAR(191) NULL,
    `parts_replaced` JSON NULL,
    `status` VARCHAR(50) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pm_cassette_details_cassette_id_status_idx`(`cassette_id`, `status`),
    INDEX `pm_cassette_details_pm_id_idx`(`pm_id`),
    UNIQUE INDEX `pm_cassette_details_pm_id_cassette_id_key`(`pm_id`, `cassette_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(36) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `user_type` VARCHAR(50) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_user_id_user_type_idx`(`user_id`, `user_type`),
    INDEX `refresh_tokens_token_idx`(`token`),
    INDEX `refresh_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warranty_configurations` (
    `id` CHAR(36) NOT NULL,
    `customer_bank_id` CHAR(36) NOT NULL,
    `warranty_type` ENUM('MA', 'MS', 'IN_WARRANTY', 'OUT_WARRANTY') NOT NULL,
    `warranty_period_days` INTEGER NOT NULL,
    `max_warranty_claims` INTEGER NULL DEFAULT 1,
    `unlimited_claims` BOOLEAN NOT NULL DEFAULT false,
    `warranty_extension_days` INTEGER NULL,
    `requires_approval` BOOLEAN NOT NULL DEFAULT false,
    `auto_approve_first_claim` BOOLEAN NOT NULL DEFAULT true,
    `free_repair_on_warranty` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `warranty_configurations_customer_bank_id_idx`(`customer_bank_id`),
    INDEX `warranty_configurations_warranty_type_idx`(`warranty_type`),
    INDEX `warranty_configurations_is_active_idx`(`is_active`),
    UNIQUE INDEX `warranty_configurations_customer_bank_id_warranty_type_key`(`customer_bank_id`, `warranty_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bank_pengelola_assignments` ADD CONSTRAINT `bank_pengelola_assignments_customer_bank_id_fkey` FOREIGN KEY (`customer_bank_id`) REFERENCES `customers_banks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_pengelola_assignments` ADD CONSTRAINT `bank_pengelola_assignments_pengelola_id_fkey` FOREIGN KEY (`pengelola_id`) REFERENCES `pengelola`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengelola_users` ADD CONSTRAINT `pengelola_users_pengelola_id_fkey` FOREIGN KEY (`pengelola_id`) REFERENCES `pengelola`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `machines` ADD CONSTRAINT `machines_customer_bank_id_fkey` FOREIGN KEY (`customer_bank_id`) REFERENCES `customers_banks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `machines` ADD CONSTRAINT `machines_pengelola_id_fkey` FOREIGN KEY (`pengelola_id`) REFERENCES `pengelola`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `machine_identifier_history` ADD CONSTRAINT `machine_identifier_history_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassettes` ADD CONSTRAINT `cassettes_cassette_type_id_fkey` FOREIGN KEY (`cassette_type_id`) REFERENCES `cassette_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassettes` ADD CONSTRAINT `cassettes_customer_bank_id_fkey` FOREIGN KEY (`customer_bank_id`) REFERENCES `customers_banks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassettes` ADD CONSTRAINT `cassettes_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassettes` ADD CONSTRAINT `cassettes_replaced_cassette_id_fkey` FOREIGN KEY (`replaced_cassette_id`) REFERENCES `cassettes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassettes` ADD CONSTRAINT `cassettes_replacement_ticket_id_fkey` FOREIGN KEY (`replacement_ticket_id`) REFERENCES `problem_tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair_tickets` ADD CONSTRAINT `repair_tickets_cassette_id_fkey` FOREIGN KEY (`cassette_id`) REFERENCES `cassettes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair_tickets` ADD CONSTRAINT `repair_tickets_repaired_by_fkey` FOREIGN KEY (`repaired_by`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair_tickets` ADD CONSTRAINT `repair_tickets_original_repair_id_fkey` FOREIGN KEY (`original_repair_id`) REFERENCES `repair_tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `repair_tickets` ADD CONSTRAINT `repair_tickets_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `problem_tickets` ADD CONSTRAINT `problem_tickets_cassette_id_fkey` FOREIGN KEY (`cassette_id`) REFERENCES `cassettes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `problem_tickets` ADD CONSTRAINT `problem_tickets_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `problem_tickets` ADD CONSTRAINT `problem_tickets_reported_by_fkey` FOREIGN KEY (`reported_by`) REFERENCES `pengelola_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_cassette_details` ADD CONSTRAINT `ticket_cassette_details_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `problem_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_cassette_details` ADD CONSTRAINT `ticket_cassette_details_cassette_id_fkey` FOREIGN KEY (`cassette_id`) REFERENCES `cassettes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_deliveries` ADD CONSTRAINT `cassette_deliveries_cassette_id_fkey` FOREIGN KEY (`cassette_id`) REFERENCES `cassettes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_deliveries` ADD CONSTRAINT `cassette_deliveries_received_by_fkey` FOREIGN KEY (`received_by`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_deliveries` ADD CONSTRAINT `cassette_deliveries_sent_by_fkey` FOREIGN KEY (`sent_by`) REFERENCES `pengelola_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_deliveries` ADD CONSTRAINT `cassette_deliveries_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `problem_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_returns` ADD CONSTRAINT `cassette_returns_cassette_id_fkey` FOREIGN KEY (`cassette_id`) REFERENCES `cassettes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_returns` ADD CONSTRAINT `cassette_returns_received_by_fkey` FOREIGN KEY (`received_by`) REFERENCES `pengelola_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_returns` ADD CONSTRAINT `cassette_returns_sent_by_fkey` FOREIGN KEY (`sent_by`) REFERENCES `hitachi_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cassette_returns` ADD CONSTRAINT `cassette_returns_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `problem_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preventive_maintenances` ADD CONSTRAINT `preventive_maintenances_assigned_engineer_fkey` FOREIGN KEY (`assigned_engineer`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preventive_maintenances` ADD CONSTRAINT `preventive_maintenances_requested_by_pengelola_fkey` FOREIGN KEY (`requested_by_pengelola`) REFERENCES `pengelola_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preventive_maintenances` ADD CONSTRAINT `preventive_maintenances_requested_by_hitachi_fkey` FOREIGN KEY (`requested_by_hitachi`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preventive_maintenances` ADD CONSTRAINT `preventive_maintenances_cancelled_by_fkey` FOREIGN KEY (`cancelled_by`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preventive_maintenances` ADD CONSTRAINT `preventive_maintenances_completed_by_fkey` FOREIGN KEY (`completed_by`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `preventive_maintenances` ADD CONSTRAINT `preventive_maintenances_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `hitachi_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pm_cassette_details` ADD CONSTRAINT `pm_cassette_details_pm_id_fkey` FOREIGN KEY (`pm_id`) REFERENCES `preventive_maintenances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pm_cassette_details` ADD CONSTRAINT `pm_cassette_details_cassette_id_fkey` FOREIGN KEY (`cassette_id`) REFERENCES `cassettes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warranty_configurations` ADD CONSTRAINT `warranty_configurations_customer_bank_id_fkey` FOREIGN KEY (`customer_bank_id`) REFERENCES `customers_banks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
