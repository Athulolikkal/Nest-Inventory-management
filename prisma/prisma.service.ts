import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }

  async Connection() {
    try {
      await this.$connect();
      console.log('Connected to Render PostgreSQL successfully!');
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      await this.$disconnect();
    }
  }
}