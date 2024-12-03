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

//@ts-ignore
dayjs.extend(dayjs_plugin_relativeTime);

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
      <img src=${xdcget_export + "/" + app.icon_relname} loading="lazy" alt="Icon for ${app.name}" />
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
  
  return html`
    <!-- Only show the modal that matches the app ID that was clicked -->
    <div role="dialog" aria-modal="true" class="${modal === app.app_id ? 'active' : 'hidden'}">
      <div class="app-container">
        <img src="${xdcget_export + "/" + app.icon_relname}" loading="lazy" alt="Icon of ${app.name}" />
        <div class="metadata">
          <div class="title">${app.name}</div>
          <div class="description">
            <span class="subtitle">${subtitle}</span>
          </div>
          <div class="date">Last updated ${dayjs(app.date).fromNow()}</div>
        </div>
      </div>
      <div class="description-full">
        ${description}
      </div>
      <div class="button-container">
        <a href="${xdcget_export + "/" + app.cache_relname}" target="_blank" class="button">
          Download
        </a>
        <button class="ghost" onClick=${() => toggleModal(false)}>Close</button>
      </div>
    </div>
  `;
};

/*
<Search> deals with searching and filtering webxdc apps
*/

const Search = ({apps, setSearchResults}) => {
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
  
  const searchFieldRef = useRef(null);
  const updateSearch = useMemo(() => {
    return () => {
      if (searchFieldRef.current) {
        const query = searchFieldRef.current.value;
        if (query) {
          const results = fuse.search(query)
          setSearchResults(results);
          // console.log("search result", {results});
          return;
        }
      }
      setSearchResults(
        apps
          .map((app) => ({ item: app }))
          .sort(
            (a, b) =>
              new Date(b.item.date).getTime() - new Date(a.item.date).getTime()
          )
      );
    };
  }, [fuse, apps]);

  useEffect(() => {
    // do the initial update or when applist changes
    updateSearch();
  }, [apps]);

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
  const toggleModal = (appId) => {
    if(appId) {
      viewModal(appId);
      window.location.hash = appId;
    } else {
      viewModal(false);
      window.location.hash = '';
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

  const [searchResults, setSearchResults] = useState();

  console.count('render');
  
  return html`
    <${Search} apps=${apps} setSearchResults=${setSearchResults}/>
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
  `;
};

window.onload = async () => {
  render(html`<${MainScreen} />`, document.getElementById('apps'));
};
