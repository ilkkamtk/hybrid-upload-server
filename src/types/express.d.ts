import {TokenContent} from 'hybrid-types/DBTypes';

declare global {
  namespace Express {
    interface Locals {
      user: TokenContent;
      screenshots: string[];
    }
  }
}

export {};
