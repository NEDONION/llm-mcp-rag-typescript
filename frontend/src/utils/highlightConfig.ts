import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'css',
  'xml',
  'sql',
  'vue',
  'plaintext',
];

languages.forEach(async (lang) => {
  try {
    const module = await import(
      /* @vite-ignore */ `highlight.js/lib/languages/${lang}`
    );
    hljs.registerLanguage(lang, module.default);
  } catch (error) {
    console.warn(`Failed to load language: ${lang}`, error);
  }
});

try {
  import(/* @vite-ignore */ 'highlightjs-vue')
    .then((module) => {
      hljs.registerLanguage('vue', module.default);
    })
    .catch((error) => {
      console.warn('Vue syntax highlighting not available', error);
    });
} catch (error) {
  console.warn('Vue syntax highlighting not available', error);
}

export default hljs;
