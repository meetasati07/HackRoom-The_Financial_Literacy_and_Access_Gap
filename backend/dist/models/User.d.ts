import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    mobile: string;
    email: string;
    password: string;
    coins: number;
    level: string;
    completedQuiz: boolean;
    refreshTokens: string[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map