const Markmap = require('markmap-lib/dist/transform');
import { Base64 } from 'js-base64';
import MarkdownIt = require('markdown-it');

//const _idRecognizer = /^\s*(markmap|mdmm)((\s+|:|\{)[^`~]*)?$/i;
const _idRecognizer = /^(markmap|mdmm)$/i;

export default function markdownItMarkmap(md: MarkdownIt) {
    const fallback = md.renderer.rules.fence?.bind(md.renderer.rules);

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];

        if (_idRecognizer.test(token.info)) {
            try {
                const attrs = token.attrs ? token.attrs.map(e => ({ [e[0].toLowerCase()]: e[1] })) : [];
                const { root } = Markmap.transform(token.content);
                const data = { attrs: Object.assign({}, ...attrs), root };

                return `<svg class="markmap">${Base64.encode(JSON.stringify(data))}</svg>`;
            } catch (ex) {
                return `<pre>${ex}</pre>`
            }
        }

        return fallback?.(tokens, idx, options, env, self) ?? `<pre>${token.content}</pre>`;
    };
};