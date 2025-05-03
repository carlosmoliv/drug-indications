import { XMLParser } from 'fast-xml-parser';
import { Injectable } from '@nestjs/common';

@Injectable()
export class XmlParserService {
  private client: XMLParser;

  constructor() {
    this.client = new XMLParser();
  }

  parse(xmlData: string) {
    return this.client.parse(xmlData);
  }
}
