import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiClientService {
  private readonly axiosInstance: AxiosInstance;
  constructor(private readonly configSerivce:ConfigService) {
    this.axiosInstance = axios.create({
      baseURL:this.configSerivce.get<string>('INVENTORY_BASE_URL'),
      headers: {
        'x-api-key':this.configSerivce.get<string>('INVENTORY_API'),
      },
    });
  }
  apiRequest(): AxiosInstance {
    return this.axiosInstance;
  }
}
