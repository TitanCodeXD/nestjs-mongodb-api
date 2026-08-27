import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

//Swagger
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

// Public decorator
import { Public } from './auth/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @ApiOperation({ summary: 'API Test Route' })
  @ApiResponse({
    status: 200,
    description: 'API Test Route Working',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
