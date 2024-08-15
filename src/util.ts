import { DataView, DataSet, csvParser } from '@visactor/vdataset';

export function csv2DataMap(csvData: string | string[]): Record<string, any> {
  if (!Array.isArray(csvData)) {
    csvData = [csvData];
  }

  const jsonData: Record<string, any> = {};
  csvData.forEach((d, i) => {
    const dataSet = new DataSet();
    dataSet.registerParser('csv', csvParser);
    const dataView = new DataView(dataSet, { name: 'data' });
    dataView.parse(d, {
      type: 'csv',
    });
    jsonData[i.toString()] = dataView.latestData;
  });

  return jsonData;
}

export function csv2json(csvData: string) {
  const dataSet = new DataSet();
  dataSet.registerParser('csv', csvParser);
  const dataView = new DataView(dataSet, { name: 'data' });
  dataView.parse(csvData, {
    type: 'csv',
  });

  console.log(dataView.latestData);

  return filterEmptyData(dataView.latestData);
}

function filterEmptyData(data: Record<string, any>[]) {
  try {
    const keys = Object.keys(data[0]);
    keys.forEach(k => {
      if (data.every(item => item[k] == null)) {
        data.forEach(item => delete item[k]);
      }
    });
    if ((data as any).columns && (data as any).columns.length) {
      (data as any).columns = (data as any).columns.filter((k: any) => k != null);
    }
    // 如果存在空字符串标题，直接过滤掉
    if ((data as any).columns.includes('')) {
      (data as any).columns = (data as any).columns.filter((k: any) => k !== '');
      data.forEach(item => delete item['']);
    }
    return data;
  } catch (err) {
    return data;
  }
}

export function json2Csv(json: Record<string, any>) {
  return Object.keys(json).map(k => {
    const data = json[k];
    if (!data.length) return;
    const columns = Object.keys(data[0]);
    let str = columns.join(',');
    str += '\n';
    data.forEach((item: any) => {
      columns.forEach((k, i) => {
        if (i !== 0) {
          str += ',';
        }
        str += item[k];
      });
      str += '\n';
    });
    return str;
  })
}

export function json2Map(json: any) {
  const out = new Map();
  const keys = Object.keys(json);
  keys.forEach(k => {
    out.set(k, json[k]);
  });
  return out;
}
export function map2Json(map: Map<string, any>) {
  const out: Record<string, any> = {};
  map.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}
