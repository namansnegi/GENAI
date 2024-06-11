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
import neoai1_2ogg from './neoai1_2.ogg';
import neoai2_2ogg from './neoai2_2.ogg';
import neoai3_2ogg from './neoai3_2.ogg';
import neoai4_2ogg from './neoai4_2.ogg';
import submit2ogg from './submit2.ogg';
import { createAudioButton, playAudio, typingEffectFunction, activateMic } from './utils';


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

const demo1Button = document.getElementById('demo1')!;
demo1Button.addEventListener('click', () => {
  window.location.href = "./index.html";
});
createAudioButton(audioMotion, submit2ogg, 'submit-button', "Vous êtes un développeur Python freelance. <br><br> \
Vous avez récemment livré un projet à un client qui vous a engagé pour développer un script automatisant certaines tâches de traitement de données. <br><br> \
Le projet a été discuté et validé par le client avant le début du développement. Vous avez travaillé sur le projet pendant deux semaines et l'avez livré dans les délais impartis. <br><br>\
Le client revient vers vous avec plusieurs plaintes. Vous allez maintenant répondre au client.<br><br>");

createAudioButton(audioMotion, neoai1_2ogg, 'neoai1', "Bonjour. J'ai des problèmes avec le script que vous avez développé pour nous. Il plante souvent et prend beaucoup trop de temps à s'exécuter.<br><br>\
De plus, il manque de la documentation, et certaines fonctionnalités que nous avons discutées ne sont même pas présentes. C'est vraiment frustrant.<br><br>");

createAudioButton(audioMotion, neoai2_2ogg, 'neoai2', "Eh bien, chaque fois que je lance le script, il plante avec une erreur IndexError: list index out of range.<br>\
Aussi, le traitement des données prend plus de 30 minutes, alors que vous aviez dit que ce serait beaucoup plus rapide. <br><br>\
Et franchement, sans documentation, c'est presque impossible de comprendre ce qui se passe dans votre code. <br><br>");

createAudioButton(audioMotion, neoai3_2ogg, 'neoai3', "Il manque la fonctionnalité de filtrage avancé des données <br>\
et l'exportation en format Excel que nous avions discutée.<br><br>");

createAudioButton(audioMotion, neoai4_2ogg, 'neoai4', "D'accord, cela me semble un bon plan.<br><br>\
 J'attends votre e-mail et notre réunion de suivi. J'espère que tout sera réglé rapidement. <br><br>\
 -----------<br><br>\
 Merci pour l'échange avec le client mécontent. Voici ce que vous avez su faire: <br><br>\
- Écouter les préoccupations du client de manière proactive.<br><br>\
- Reconnaître et comprendre les problèmes soulevés.<br><br>\
- Proposer des solutions et un plan d'action pour résoudre les problèmes.<br><br>\
- Maintenir une attitude professionnelle et calme tout au long de l'échange.<br><br>\
- Rétablir la satisfaction du client et préserver la relation professionnelle.");
