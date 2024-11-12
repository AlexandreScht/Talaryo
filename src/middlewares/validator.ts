import { ClientException, InvalidArgumentError } from '@/exceptions';
import type { validatorsProps } from '@/interfaces/validation';
import { ObjectSchema, ValidationError } from 'yup';

const validator = (
  validators: validatorsProps,
  values: object,
): void | Error => {
  if (!(validators instanceof ObjectSchema)) {
    throw new InvalidArgumentError('validators is not a Yup schema');
  }
  try {
    validators.validateSync(values);
    return;
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw new InvalidArgumentError(`Keys < ${err.path} > ${err.message}`);
    }
    throw new ClientException(500, 'error validation');
  }
};

export default validator;
