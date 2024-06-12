import './style.css';
import 'prismjs';
import 'prismjs/themes/prism-twilight.min.css';
import 'prismjs/components/prism-python';
import { EditorState, Compartment } from '@codemirror/state';
import { barf } from 'thememirror';
import { python } from '@codemirror/lang-python';
import { EditorView, basicSetup } from 'codemirror';
import { defaultKeymap } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import AudioMotionAnalyzer from 'audiomotion-analyzer';

import { handleButtonClick } from '../utils';

const submitButton = document.getElementById('submit-button') as HTMLButtonElement | null;
const editorResponse = document.getElementById(
  'editorResponse',
) as HTMLDivElement;
const editorProblemStatement = document.getElementById(
  'editorProblemStatement',
)?.innerText;

if (!submitButton) {
  throw new Error("Element 'submit-button' not found");
}

if (!editorResponse) {
  throw new Error("Element 'editorResponse' not found");
}

const chatHistory = [
  {
    role: 'assistant',
    content: `Problem: ${editorProblemStatement}`,
  },
];

submitButton!.addEventListener('click', (event: MouseEvent) => {
  handleButtonClick(
    event,
    chatHistory,
    submitButton,
    editorResponse,
    audioMotion
  );
});

let language = new Compartment(),
  tabSize = new Compartment();

let stateOfEditor = EditorState.create({
  doc: '#entrez votre solution ci-dessous:\n\n\n\n#utilisation de la classe:\nitem = Item(10, 5)\nprint(item.price) # 10\nprint(item.weight) # 5',
  extensions: [
    basicSetup,
    keymap.of(defaultKeymap),
    language.of(python()),
    tabSize.of(EditorState.tabSize.of(8)),
    barf,
  ],
});

const editorElement = document.getElementById('editorResponse');
if (!editorElement) {
  throw new Error("Element 'editorResponse' not found");
}

let view = new EditorView({
  state: stateOfEditor,
  parent: editorElement,
});

const demo2Button = document.getElementById('demo2');
if (!demo2Button) {
  throw new Error("Element 'demo2' not found");
}
demo2Button.addEventListener('click', () => {
  window.location.href = './demo2.html';
});

const aiElement = document.getElementById('ai');
if (!aiElement) {
  throw new Error("Element 'ai' not found");
}

const audioMotion = new AudioMotionAnalyzer(aiElement, {
  gradient: 'steelblue',
  overlay: true,
  showBgColor: true,
  bgAlpha: 0,
  mode: 8,
  showScaleX: false,
  reflexRatio: 0.5,
  reflexAlpha: 1,
  roundBars: true,
  showPeaks: false,
  outlineBars: true,
  lineWidth: 3,
  fillAlpha: 0.3,
});
