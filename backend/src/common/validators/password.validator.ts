import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Password Policy:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Minimum 8 characters
          if (value.length < 8) {
            return false;
          }

          // At least one uppercase letter
          if (!/[A-Z]/.test(value)) {
            return false;
          }

          // At least one lowercase letter
          if (!/[a-z]/.test(value)) {
            return false;
          }

          // At least one number
          if (!/[0-9]/.test(value)) {
            return false;
          }

          // At least one special character
          if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        },
      },
    });
  };
}

