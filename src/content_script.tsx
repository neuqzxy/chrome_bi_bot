import VMind, { Model } from "@visactor/vmind";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { API_KEY, END_POINT, PROMPT } from './config';
import VChart from "@visactor/vchart";
import { csv2json } from 'csvify-json';

async function getCSVData(text: string) {
  const prompt = `${PROMPT}\n${text}`;
  const response = await fetch(END_POINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-0613',
      messages: [
        { "role": "user", "content": prompt }
      ],
      max_tokens: 2048,
      n: 1,
      stop: null,
      temperature: 0.5,
    })
  });
  const result = await response.json();
  return result.choices[0].message.content as string;
}

async function askVmind(csvData: string) {
  const vmind = new VMind({
    url: END_POINT,
    model: Model.GPT_4_0613, //指定你指定的模型
    headers: { //指定调用大模型服务时的header
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  const dataset = csv2json(csvData) as any;
  const fieldInfo  = vmind.getFieldInfo(dataset);
  const userPrompt='use appropriate charts to display this data'
  const { spec, time } = await vmind.generateChart(userPrompt, fieldInfo, dataset);
  return spec;
}

const Popup = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [prepareForSearch, setPrepareForSearch] = useState<boolean>(false);

  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const posX = useMemo(() => mouseX, [mouseX]);
  const posY = useMemo(() => mouseY, [mouseY]);
  const [selectText, setSelectText] = useState<string>('');

  // const containerRef = useRef();

  useEffect(() => {
    
    const handleMouseUp = (event: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
    
      const text = selection.toString().trim();
      if (text && text !== selectText) {
        setMouseX(event.pageX);
        setMouseY(event.pageY);
        setVisible(true);
        setPrepareForSearch(true);
        setSelectText(text);
      }
      if (!text) {
        setVisible(false);
      }
    }
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [selectText]);

  const handleSearch = useCallback(() => {
    async function _handleSearch() {
      // get data
      const csvData = await getCSVData(selectText);
      // search by vmind
      const spec = await askVmind(csvData);
      // render by vchart
      const vchart = new VChart(spec, { dom: 'chart' });
      vchart.renderSync();
      setPrepareForSearch(false);
    }
    
    _handleSearch();
  }, [selectText]);

  return (
    <div
      // ref={containerRef}
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
              minWidth: '150px'
            }}
            onClick={handleSearch}
          >
            analysis for me
          </button>
        )
      }
      <div
        style={{
          display: prepareForSearch ? 'none' : 'block',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          padding: 6
        }}
      >
        <div style={{ width: 700, height: 300 }} id="chart"></div>
      </div>
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

