import { Html, Head, Main, NextScript } from 'next/document';
import type { DocumentContext, DocumentProps } from 'next/document';
import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps,
} from '@mui/material-nextjs/v13-pagesRouter';

export default function Document(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang='en'>
      <Head />
      <DocumentHeadTags {...props} />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
