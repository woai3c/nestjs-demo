import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Users extends Document {
  @Prop()
  address: string;

  @Prop()
  avatar: string;

  @Prop()
  city: string;

  @Prop()
  description: string;

  @Prop()
  gender: string;

  @Prop()
  email: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  failedLoginAttempts: number;

  @Prop()
  lockUntil: number;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
