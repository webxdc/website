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
      onClick=${() => toggleModal(app.app_id)}>
      <img src=${xdcget_export + "/" + app.icon_relname} loading="lazy" alt="Icon for ${app.name} app" />
      <div class="props">
        <div class="title">${app.name}</div>
        <div class="description">
          <span class="subtitle">${subtitle}</span>
        </div>
        <div class="date">Last updated ${dayjs(app.date).fromNow()}</div>
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
          <div class="title">${app.name}</div>
          <div class="description">
            <span class="subtitle" id="${app.app_id}_label">${subtitle}</span>
          </div>
          <div class="date">Last updated ${dayjs(app.date).fromNow()}</div>
        </div>
      </div>
      <div class="description-full" id="${app.app_id}_desc">
        ${description}
      </div>
      <div class="additional-info">
        <div>
          <b>Updated on: </b>${dayjs(app.date).format("l")} (${app.tag_name})
        </div>
        <div>
          <b>Size: </b>${size}
        </div>
        <div>
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
    <header>
      <nav><input
        type="search"
        placeholder="Search"
        id="search_field"
        ref=${searchFieldRef}
        oninput=${updateSearch}
      /></nav>
    </header>
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

  console.count('render');
  
  return html`
    <${Search} apps=${apps} setSearchResults=${setSearchResults} filterGroup=${filterGroup} />
    <div id="app_container">
      ${loading && html`<div>Loading</div>`}
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
        <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
      </svg>
      Home
    </button>
    <button onClick=${() => { setFilterGroup("tool"); }} class=${filterGroup === "tool" ? "active" : ""}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
        <path d="M16.5 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3v-6A4.5 4.5 0 0 1 10.5 6h6Z" />
        <path d="M18 7.5a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3H18Z" />
      </svg>
      Utilities
    </button>
    <button onClick=${() => { setFilterGroup("game"); }} class=${filterGroup === "game" ? "active" : ""}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
        <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 0 1 .878.645 49.17 49.17 0 0 1 .376 5.452.657.657 0 0 1-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 0 0-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 0 1-.595 4.845.75.75 0 0 1-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 0 1-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 0 1-.658.643 49.118 49.118 0 0 1-4.708-.36.75.75 0 0 1-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 0 0 5.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 0 0 .659-.663 47.703 47.703 0 0 0-.31-4.82.75.75 0 0 1 .83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 0 0 .657-.642Z" />
      </svg>
      Games
    </button>
  </div>`;
}

window.onload = async () => {
  render(html`<${MainScreen} />`, document.getElementById('apps'));
};
