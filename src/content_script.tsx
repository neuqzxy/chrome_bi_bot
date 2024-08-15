import VMind, { Model } from "@visactor/vmind";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { API_KEY } from './config';
import VChart from "@visactor/vchart";

async function askVmind() {
  const vmind = new VMind({
    url: 'https://api.xty.app/v1/chat/completions',
    model: Model.GPT_4_0613, //指定你指定的模型
    headers: { //指定调用大模型服务时的header
      'api-key': API_KEY //Your LLM API Key
    }
  });
  const csvData = `商品名称,region,销售额
  可乐,south,2350
  可乐,east,1027
  可乐,west,1027
  可乐,north,1027
  雪碧,south,215
  雪碧,east,654
  雪碧,west,159
  雪碧,north,28
  芬达,south,345
  芬达,east,654
  芬达,west,2100
  芬达,north,1679
  醒目,south,1476
  醒目,east,830
  醒目,west,532
  醒目,north,498`;
  //传入csv字符串，获得fieldInfo和dataset用于图表生成
  const { fieldInfo, dataset } = vmind.parseCSVData(csvData);
  const userPrompt='show me the changes in sales rankings of various car brand'
  const { spec, time } = await vmind.generateChart(userPrompt, fieldInfo, dataset);
  return spec;
}

const Popup = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [prepareForSearch, setPrepareForSearch] = useState<boolean>(false);

  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const posX = useMemo(() => mouseX + window.scrollX, [mouseX]);
  const posY = useMemo(() => mouseY + window.scrollY, [mouseY]);
  const [selectText, setSelectText] = useState<string>('');

  useEffect(() => {
    
    const handleMouseUp = (event: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
    
      const text = selection.toString().trim();
      if (text) {
        setMouseX(event.pageX);
        setMouseY(event.pageY);
        setVisible(true);
        setPrepareForSearch(true);
        setSelectText(text);
      }
    }
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      // document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, []);

  const handleSearch = useCallback(() => {
    async function _handleSearch() {
      // get data
      // search by vmind
      const spec = await askVmind();
      // render by vchart
      const vchart = new VChart(spec, { dom: 'chart' });
      vchart.renderSync();
      setPrepareForSearch(false);
    }
    

  }, []);

  return (
    <div
      style={{ position: 'absolute', left: posX, top: posY, display: visible ? 'block' : 'none' }}
    >
      {
        prepareForSearch && (
          <button
            style={{
              backgroundColor: '#04AA6D',
              border: 'none',
              color: 'white',
              padding: '6px 8px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '16px',
              minWidth: '120px'
            }}
            onClick={handleSearch}
          >
            it's bot time
          </button>
        )
      }
      
    </div>
  );
};

const container = document.createElement('div');
container.id = 'chrome_bot';
container.style.position = 'absolute';
container.style.left = '0';
container.style.top = '0';
container.style.zIndex = '999999999999';
document.body.appendChild(container);

const root = createRoot(document.getElementById("chrome_bot")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

