import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function AtLeastOneNotEmpty(fields: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'atLeastOneNotEmpty',
            target: object.constructor,
            propertyName: propertyName,
            constraints: fields,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const obj = args.object as any;
                    return fields.some(field => {
                        const fieldValue = obj[field];
                        return fieldValue !== null && fieldValue !== undefined && fieldValue.toString().trim() !== '';
                    });
                },
                defaultMessage(args: ValidationArguments) {
                    return ` At least one of (${args.constraints.join(', ')}) must be provided.`;
                },
            },
        });
    };
}