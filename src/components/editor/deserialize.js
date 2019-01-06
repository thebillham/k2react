// const DefaultParse = HtmlSerializer.parseHtml;
// HtmlSerializer.parseHtml = html => {
//   const tree = DefaultParse.apply(HtmlSerializer, [html]);
//   const collapse = require('collapse-whitespace');
//   collapse(tree);
//
//   // ensure that no DIVs contain both element children and text node children. This is
//   // not allowed by Slate's core schema: blocks must contain inlines and text OR blocks.
//   // https://docs.slatejs.org/guides/data-model#documents-and-nodes
//   const treeWalker = document.createTreeWalker(tree, NodeFilter.SHOW_ELEMENT, {
//     acceptNode: node => {
//       return BLOCK_TAGS.includes(node.nodeName.toLowerCase())
//         ? NodeFilter.FILTER_ACCEPT
//         : NodeFilter.FILTER_SKIP;
//     },
//   });
//
//   const needWrapping = [];
//   while (treeWalker.nextNode()) {
//     const div = treeWalker.currentNode;
//     const hasBlockChild = Array.from(div.childNodes).find(n =>
//       BLOCK_TAGS.includes(n.nodeName.toLowerCase())
//     );
//     if (hasBlockChild) {
//       const textOrInlineChildren = Array.from(div.childNodes).filter(
//         n => !BLOCK_TAGS.includes(n.nodeName.toLowerCase())
//       );
//       needWrapping.push(...textOrInlineChildren);
//     }
//   }
//
//   needWrapping.forEach(tn => {
//     // no need to wrap <span></span> or a stray <a></a>, just remove these
//     // pointless inline children
//     if (tn.textContent.length === 0) {
//       tn.remove();
//       return;
//     }
//
//     const wrapped = document.createElement('div');
//     tn.parentNode.replaceChild(wrapped, tn);
//     wrapped.appendChild(tn);
//
//     // Now that we've wrapped the text node into a block, it forces a newline.
//     // If it's preceded by a <br>, that <br> is no longer necessary.
//     if (wrapped.previousSibling && wrapped.previousSibling.nodeName === 'BR') {
//       wrapped.previousSibling.remove();
//     }
//   });
//
//   // We coerce <p> tags to <div> tags and don't apply any padding. Any incoming <p>
//   // tags should be followed by <br> tags to maintain the intended spacing.
//   const pWalker = document.createTreeWalker(tree, NodeFilter.SHOW_ELEMENT, {
//     acceptNode: node => {
//       return node.nodeName === 'P' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
//     },
//   });
//
//   while (pWalker.nextNode()) {
//     const p = pWalker.currentNode;
//     if (p.nextSibling && p.textContent.trim().length) {
//       const br = document.createElement('br');
//       p.parentNode.insertBefore(br, p.nextSibling);
//     }
//   }
//
//   return tree;
// };
//
// export function convertFromHTML(html) {
//   return HtmlSerializer.deserialize(html);
// }
