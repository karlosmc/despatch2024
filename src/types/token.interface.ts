import { ParamsInterface } from "./params.interface";

export interface TokenInterface {
  company: number;
  user:number;
  access_token: string;
  token_type:string;
  expires_in: number;
  created_at: string;
  expires_at: string;
  sunatParams?:ParamsInterface
}