/* eslint-disable node/no-unpublished-import */
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
