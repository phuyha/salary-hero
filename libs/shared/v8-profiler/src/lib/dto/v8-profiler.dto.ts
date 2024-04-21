import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class V8ProfilerDto {
  @ApiProperty({
    type: Number,
    description: 'Profiling duration in second',
    required: true,
  })
  @IsNotEmpty()
  @Transform(obj => parseInt(obj.value))
  @IsInt()
  @Min(1)
  @Max(30)
  durationSec: number = 5;
}
