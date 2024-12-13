//@ts-check
import {
  html,
  render,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "./deps/preact_and_htm.js";
import Fuse from "./deps/fuse.basic.esm.min.js";
import dayjs from "./deps/dayjs/dayjs_with_relative_time.min.js";
import "./deps/dayjs/localizedFormat.min.js.js";

//@ts-ignore
dayjs.extend(dayjs_plugin_relativeTime);
//@ts-ignore
dayjs.extend(dayjs_plugin_localizedFormat);

// without a trailing slash
const xdcget_export = "https://apps.testrun.org";

/*
Each <App> is implemented as a button that, when clicked, would show
more details about the webxdc app by showing a <Dialog> 
*/
const App = ({ app, toggleModal }) => {
  const subtitle = app.description.split('\n').shift();

  return html`
    <button
      class="app"
      onClick=${() => toggleModal(app.app_id)}
      key=${app.app_id}>
      <img src=${xdcget_export + "/" + app.icon_relname} loading="lazy" alt="Icon for ${app.name} app" />
      <div class="props">
        <div class="title ellipse">${app.name}</div>
        <div class="description ellipse">${subtitle}</div>
        <div class="author ellipse">${extract_author(app.source_code_url)}</div>
      </div>
    </button>
  `;
};

/*
<Dialog> creates an overlay that shows the metadata of an app and a button of
downloading the actual webxdc file from the server.
*/
const Dialog = ({app, modal, toggleModal}) => {
  const [subtitle, description] = [app.description.split('\n').shift(), app.description.split('\n').slice(1).join(' ')];

  // Change the title when a dialog is open
  if(modal === app.app_id) {
    document.title = `webxdc apps: ${app.name}`;
  }

  // Display the size of the webxdc apps in a more human readable format
  let size = `${(app.size/1000).toLocaleString(undefined, {maximumFractionDigits: 1})} kb`;
  if(app.size > 1000000) {
    size = `${(app.size/1000000).toLocaleString(undefined, {maximumFractionDigits: 1})} mb`;
  }

  return html`
    <!-- Only show the modal that matches the app ID that was clicked -->
    <div id=${app.app_id} role="dialog" aria-labelledby="${app.app_id}_label" aria-describedby="${app.app_id}_desc" aria-modal="true" class="${modal === app.app_id ? 'active' : 'hidden'}">
      <div class="app-container">
        <img src="${xdcget_export + "/" + app.icon_relname}" loading="lazy" alt="Icon of ${app.name} app" />
        <div class="metadata">
          <div class="title ellipse">${app.name}</div>
          <div class="description">
            <span class="subtitle" id="${app.app_id}_label">${subtitle}</span>
          </div>
          <div class="author">${extract_author(app.source_code_url)}</div>
        </div>
      </div>
      <div class="description-full" id="${app.app_id}_desc">
        ${description}
      </div>
      <div class="additional-info">
        <div>
          <b>Published: </b>${dayjs(app.date).format("l")} (${app.tag_name})
        </div>
        <div>
          <b>Size: </b>${size}
        </div>
        <div class="ellipse">
          <b>Source: </b><a href=${app.source_code_url} target="_blank">${app.source_code_url}</a>
        </div>
      </div>
      <div class="button-container">
        <a href="${xdcget_export + "/" + app.cache_relname}" target="_blank" class="button">
          Download
        </a>
        <button class="ghost" onClick=${() => toggleModal(false)}>Close</button>
      </div>
    </div>
  `;
}

/*
<Search> deals with searching and filtering webxdc apps
*/
const Search = ({apps, setSearchResults, filterGroup}) => {
  const fuse = useMemo(() => {
    return new Fuse(apps, {
      includeScore: true,
      threshold: 0.25,
      // Search in `author` and in `tags` array
      keys: [
        { name: "name", weight: 2 },
        { name: "description", weight: 0.2 },
      ],
    });
  }, [apps]);

  const filterResults = (result) => {
    return filterGroup === "home" ? true : result.item.category === filterGroup;
  } 
  
  const searchFieldRef = useRef(null);
  const updateSearch = useMemo(() => {
    return () => {
      if (searchFieldRef.current) {
        const query = searchFieldRef.current.value;
        if (query) {
          const results = fuse.search(query)
          setSearchResults(results.filter(filterResults));
          // console.log("search result", {results});
          return;
        }
      }
      setSearchResults(
        apps
          .map((app) => ({ item: app }))
          .filter(filterResults)
          .sort(
            (a, b) =>
              new Date(b.item.date).getTime() - new Date(a.item.date).getTime()
          )
      );
    };
  }, [fuse, apps, filterGroup]);

  useEffect(() => {
    // do the initial update or when applist changes
    updateSearch();
  }, [apps, filterGroup]);

  return html`
    <div class="search">
      <input
        type="search"
        placeholder="Search"
        id="search_field"
        ref=${searchFieldRef}
        oninput=${updateSearch}
      />
    </div>
  `;
};

/*
<MainScreen> is responsible for implementing the search function, for fetching
the app data, and for actually rendering the page contents.
*/
const MainScreen = () => {
  /** @typedef {import('./app_list.d').AppList} AppList */
  /** @type {[AppList, (newState: AppList) => void]} */
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, viewModal] = useState(false); 
  const [appIdMap, setIdMap] = useState({});
  const [searchResults, setSearchResults] = useState();
  const [filterGroup, setFilterGroup] = useState("home");

  // Fetch the data that contains all of the apps we have available
  // in the xstore.
  useEffect(() => {
    (async () => {
      console.log("fetch");
      setApps(await (await fetch(xdcget_export + "/xdcget-lock.json")).json());
      setLoading(false);
    })();
  }, []);

  // We need a map so that we can quickly verify later if 
  // an app ID is valid. We'll be using this for verifying
  // valid app ID in window.location.hash
  useEffect(() => {
    setIdMap(apps.reduce((map, app) => {
      map[app.app_id] = true;
      return map;
    }, {}));
  }, [apps]);

  // This allows us to set/unset the modal for a particular app.
  // - Open the modal
  // - Change the hash
  const toggleModal = (appId) => {
    if(appId) {
      viewModal(appId);
      window.location.hash = appId;
    } else {
      viewModal(false);
      document.title = "webxdc apps";
      window.location.hash = 'home';
    }
  };

  const onHashChange = () => {
    // Close any open modals when window.location.hash changes
    // Doesn't matter if it's valid or not.
    viewModal(false);
    if(window.location.hash.substring(1) in appIdMap) {
      toggleModal(window.location.hash.substring(1));
    }
  };

  // We set an event that triggers whenever window.location.hash changes
  useEffect(() => {
    // If the variable s already set, show the modal.
    if (window.location.hash.length > 0) {
      onHashChange();
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);

  }, [window.location.hash, appIdMap]);

  //console.count('render');
  
  return html`
    <${Search} apps=${apps} setSearchResults=${setSearchResults} filterGroup=${filterGroup} />
    <div id="app_container">
      ${loading && html`<div class="loading">Loading ...</div>`}
      ${searchResults &&
        searchResults.map((result) => html`<${App} app=${result.item} toggleModal=${toggleModal} />`)}
    </div>
    <div id="dialog_layer" class="dialogs">
      <div class="dialog-backdrop ${modal ? 'active' : 'hidden'}">
        ${searchResults && 
          searchResults.map((result) => html`<${Dialog} app=${result.item} modal=${modal} toggleModal=${toggleModal} />`)}
      </div>
    </div>
    <div id="footer">
      <a href="https://support.delta.chat/c/webxdc/20">support forum</a>
      <a href="https://webxdc.org/docs">develop apps</a>
      <a href="https://codeberg.org/webxdc/xdcget/src/branch/main/SUBMIT.md">publish apps</a>
    </div>
    <${Tabs} setFilterGroup=${setFilterGroup} filterGroup=${filterGroup} />
  `;
};

const Tabs = ({setFilterGroup, filterGroup}) => {
  return html`<div id="tabs">
    <button onClick=${() => { setFilterGroup("home"); }} class=${filterGroup === "home" ? "active" : ""}>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M10.894 22h2.212c3.447 0 5.17 0 6.345-1.012s1.419-2.705 1.906-6.093l.279-1.937c.38-2.637.57-3.956.029-5.083s-1.691-1.813-3.992-3.183l-1.385-.825C14.2 2.622 13.154 2 12 2s-2.199.622-4.288 1.867l-1.385.825c-2.3 1.37-3.451 2.056-3.992 3.183s-.35 2.446.03 5.083l.278 1.937c.487 3.388.731 5.081 1.906 6.093S7.447 22 10.894 22" opacity=".5"/><path fill="currentColor" d="M9.447 15.397a.75.75 0 0 0-.894 1.205A5.77 5.77 0 0 0 12 17.75a5.77 5.77 0 0 0 3.447-1.148a.75.75 0 0 0-.894-1.205A4.27 4.27 0 0 1 12 16.25a4.27 4.27 0 0 1-2.553-.853"/></svg>    
      Home
    </button>
    <button onClick=${() => { setFilterGroup("tool"); }} class=${filterGroup === "tool" ? "active" : ""}>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M6.96 2c.418 0 .756.31.756.692V4.09c.67-.012 1.422-.012 2.268-.012h4.032c.846 0 1.597 0 2.268.012V2.692c0-.382.338-.692.756-.692s.756.31.756.692V4.15c1.45.106 2.403.368 3.103 1.008c.7.641.985 1.513 1.101 2.842v1H2V8c.116-1.329.401-2.2 1.101-2.842c.7-.64 1.652-.902 3.103-1.008V2.692c0-.382.339-.692.756-.692"/><path fill="currentColor" d="M22 14v-2c0-.839-.013-2.335-.026-3H2.006c-.013.665 0 2.161 0 3v2c0 3.771 0 5.657 1.17 6.828C4.349 22 6.234 22 10.004 22h4c3.77 0 5.654 0 6.826-1.172S22 17.771 22 14" opacity=".5"/><path fill="currentColor" d="M18 16.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0"/></svg>    
      Utilities
    </button>
    <button onClick=${() => { setFilterGroup("game"); }} class=${filterGroup === "game" ? "active" : ""}>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12.75 6H14c3.771 0 5.657 0 6.828 1.172S22 10.229 22 14s0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14s0-5.657 1.172-6.828S6.229 6 10 6z" opacity=".5"/><path fill="currentColor" d="M8.75 12a.75.75 0 0 0-1.5 0v1.05a.2.2 0 0 1-.2.2H6a.75.75 0 0 0 0 1.5h1.05c.11 0 .2.09.2.2V16a.75.75 0 0 0 1.5 0v-1.05c0-.11.09-.2.2-.2H10a.75.75 0 0 0 0-1.5H8.95a.2.2 0 0 1-.2-.2zM15 13.5a1 1 0 1 0 0-2a1 1 0 0 0 0 2m3 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0M15.75 2a.75.75 0 0 0-1.5 0v1a.25.25 0 0 1-.25.25h-1A1.75 1.75 0 0 0 11.25 5v1h1.5V5a.25.25 0 0 1 .25-.25h1A1.75 1.75 0 0 0 15.75 3z"/></svg>      Games
    </button>
  </div>`;
}

// Extract the username from GitHub or Codeberg
const extract_author = (source_code_url) => {
  const matches = /(github.com|codeberg.org)\/([\w\-_]+)/.exec(source_code_url); 
  if(matches && matches.length === 3) {
    return matches[2];
  }
  return "";
};

window.onload = async () => {
  render(html`<${MainScreen} />`, document.getElementById('apps'));
};