/* eslint-disable @typescript-eslint/ban-ts-comment */
import { BadRequestException } from '@nestjs/common';
import * as mongoose from 'mongoose';

export function validateObjectIdPlugin(schema: mongoose.Schema): void {
  schema.pre(/^find/, function (next) {
    // @ts-expect-error
    const query = this.getFilter();
    if (query?._id && !mongoose.isValidObjectId(query._id)) {
      const err = new BadRequestException('Invalid ID supplied');
      next(err);
    } else {
      next();
    }
  });
}
