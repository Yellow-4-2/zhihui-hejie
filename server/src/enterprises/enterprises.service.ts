import { Injectable, OnModuleInit } from '@nestjs/common';

export interface Enterprise {
  id: string;
  name: string;
  category: string;
  contactPhone: string;
  settledAt: number;
}

@Injectable()
export class EnterprisesService implements OnModuleInit {
  private enterprises: Enterprise[] = [];

  onModuleInit() {
    this.enterprises = [
      { id: 'e1', name: '海尔', category: '家电', contactPhone: '0571-88888001', settledAt: new Date('2021-06-15').getTime() },
      { id: 'e2', name: '美的', category: '家电', contactPhone: '0571-88888002', settledAt: new Date('2021-08-20').getTime() },
      { id: 'e3', name: '苏宁易购', category: '零售', contactPhone: '0571-88888003', settledAt: new Date('2022-01-10').getTime() },
      { id: 'e4', name: '格力', category: '家电', contactPhone: '0571-88888004', settledAt: new Date('2022-03-05').getTime() },
    ];
  }

  findAll(keyword?: string): Enterprise[] {
    if (!keyword) return this.enterprises;
    const k = keyword.toLowerCase();
    return this.enterprises.filter(
      (e) => e.name.toLowerCase().includes(k) || e.category.toLowerCase().includes(k),
    );
  }

  findOne(id: string): Enterprise {
    const e = this.enterprises.find((x) => x.id === id);
    if (!e) throw new Error('企业不存在');
    return e;
  }
}
