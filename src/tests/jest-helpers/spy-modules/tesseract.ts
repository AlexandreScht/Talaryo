import { tesseractJest } from '@/interfaces/jest';
import tesseract from 'tesseract.js';

export default function tesseractMocked(): tesseractJest {
  return jest.spyOn(tesseract, 'recognize');
}
