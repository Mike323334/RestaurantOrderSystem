import { z } from 'zod';

export const OrderSchema = z.object({
  customerName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  customerPhone: z
    .string()
    .min(1, 'Phone is required')
    .max(20, 'Phone must be less than 20 characters')
    .trim(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().max(100),
        price: z.number().positive('Price must be positive'),
        quantity: z.number().int('Quantity must be integer').positive().max(999),
      })
    )
    .min(1, 'Cart must have at least one item'),
  total: z
    .number()
    .positive('Total must be positive')
    .max(999999, 'Total exceeds maximum'),
  orderID: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

export function validateOrder(data: unknown) {
  try {
    return { success: true, data: OrderSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return { success: false, errors: [{ path: 'unknown', message: 'Validation failed' }] };
  }
}
