import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { componentStyles } from './presentation/styles'

const injectGlobalStyles = () => {
  const globalStyles = componentStyles.createGlobalStyles()

  const styleTag = document.createElement('style')
  styleTag.textContent = `
    * {
      margin: ${globalStyles.reset.margin};
      padding: ${globalStyles.reset.padding};
      box-sizing: ${globalStyles.reset.boxSizing};
    }

    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    body {
      font-family: ${globalStyles.body.fontFamily};
      line-height: ${globalStyles.body.lineHeight};
      color: ${globalStyles.body.color};
      background-color: ${globalStyles.body.backgroundColor};
    }

    *:not(.message-list-container)::-webkit-scrollbar {
      width: ${globalStyles.scrollbar.width};
    }

    *:not(.message-list-container)::-webkit-scrollbar-track {
      background: transparent;
    }

    *:not(.message-list-container)::-webkit-scrollbar-thumb {
      background-color: ${globalStyles.scrollbar.thumb.backgroundColor};
      border-radius: ${globalStyles.scrollbar.thumb.borderRadius};
    }

    *:not(.message-list-container)::-webkit-scrollbar-thumb:hover {
      background-color: ${globalStyles.scrollbar.thumbHover.backgroundColor};
    }

    *:not(.message-list-container)::-webkit-scrollbar-button {
      display: none;
    }

    ${globalStyles.animations}
  `

  document.head.appendChild(styleTag)
}

const renderWindow = async () => {
  injectGlobalStyles()
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  )
}

renderWindow()
