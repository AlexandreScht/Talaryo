import { InvalidArgumentError, InvalidSessionError, ServicesError } from '@/exceptions';
import { returnUpdateCode } from '@/interfaces/service';
import { FindUserProps, UserDocument } from '@/interfaces/users';
import { UserModel } from '@/models/users';
import type { DeleteResult } from 'mongodb';
import { FilterQuery } from 'mongoose';
import randomatic from 'randomatic';
import { Service } from 'typedi';
import { v7 as uuid } from 'uuid';

@Service()
export class UserServiceFile {
  public async getUser(userData: FindUserProps, fields?: (keyof Partial<UserDocument>)[]): Promise<UserDocument | null> {
    try {
      let query = null;
      const selectedFields = fields.length ? fields.join(' ') : '-password';
      if ('email' in userData) {
        const { email, oAuthAccount } = userData;

        query = UserModel.findOne({
          email,
          ...(oAuthAccount ? { $or: [{ password: { $exists: false } }, { password: null }] } : { password: { $exists: true, $ne: null } }),
        }).select(selectedFields);
      }
      if ('id' in userData) {
        const { id } = userData;
        query = UserModel.findById(id).select(selectedFields);
      }
      if (!query) {
        throw new InvalidArgumentError('Search criteria must be either email or id');
      }
      return await query.exec();
    } catch (error) {
      throw new ServicesError(error);
    }
  }

  public async updateUsers(
    criteria: FilterQuery<Omit<UserDocument, 'password'>>,
    values: Partial<Omit<UserDocument, '_id' | 'email' | 'password'>>,
  ): Promise<boolean> {
    try {
      const { modifiedCount } = await UserModel.updateMany(criteria, { $set: values }).exec();

      return modifiedCount > 0;
    } catch (error) {
      throw new ServicesError(error);
    }
  }

  public async findUsers(userData: FilterQuery<UserDocument>, fields?: (keyof Omit<Partial<UserDocument>, 'password'>)[]): Promise<UserDocument[]> {
    try {
      const selectedFields = fields && fields.length ? fields.join(' ') : '-password';
      return await UserModel.find(userData).select(selectedFields).exec();
    } catch (error) {
      throw new ServicesError(error);
    }
  }

  public async deleteUser(userData: FindUserProps): Promise<DeleteResult> {
    try {
      if ('email' in userData) {
        const { email, oAuthAccount } = userData;
        return await UserModel.deleteOne({
          email,
          password: oAuthAccount ? null : { $ne: null },
        });
      }
      if ('id' in userData) {
        const { id } = userData;
        return await UserModel.findByIdAndDelete(id);
      }

      throw new InvalidArgumentError('Search criteria must be either email or id');
    } catch (error) {
      throw new ServicesError(error);
    }
  }

  public async generateTokenAccess(id: string): Promise<returnUpdateCode> {
    try {
      const updatedUser: returnUpdateCode = await UserModel.findByIdAndUpdate(
        id,
        {
          accessToken: uuid(),
        },
        { new: true },
      ).select('accessToken');
      if (updatedUser) return updatedUser;
      throw new InvalidSessionError('Unable to update the refreshToken');
    } catch (error) {
      throw new ServicesError(error);
    }
  }

  public async generateCodeAccess(id: string, digit = 4, secure = false): Promise<returnUpdateCode> {
    try {
      const updatedUser: returnUpdateCode = await UserModel.findByIdAndUpdate(
        id,
        {
          ...(!secure ? { accessToken: uuid() } : {}),
          accessCode: Number.parseInt(randomatic('0', digit), 10),
        },
        { new: true },
      ).select('accessCode accessToken email firstName');
      if (updatedUser) return updatedUser;
      throw new InvalidSessionError('Unable to update the refreshToken');
    } catch (error) {
      throw new ServicesError(error);
    }
  }
}
