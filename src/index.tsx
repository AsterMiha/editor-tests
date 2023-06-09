import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import SlateExample from './SlateExample';
import LexicalExample from './LexicalExample';
import CKEditorExample from './CKEditorExample';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route path="slate" element={<SlateExample />} />
          <Route path="lexical" element={<LexicalExample />} />
          <Route path="cke" element={<CKEditorExample />} />
        </Route>
      </Routes>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
