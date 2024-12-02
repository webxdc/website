//@ts-check
import {
  html,
  render,
  useReducer,
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

/**
 * @param {{app: import('./app_list.d').AppEntry}} param0
 */
const App = ({ app, toggleModal }) => {
  const [subtitle, description] = [app.description.split('\n').shift(), app.description.split('\n').slice(1).join(' ')];
  return html`
    <button
      class="app"
      onClick=${() => toggleModal(app.app_id)}>
      <img src=${xdcget_export + "/" + app.icon_relname} loading="lazy" />
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

const Dialog = ({app, modal}) => {
  console.log(app);
  const [subtitle, description] = [app.description.split('\n').shift(), app.description.split('\n').slice(1).join(' ')];

  // Only show the modal that matches the app ID that was clicked
  return html`
    <div role="dialog" aria-modal="true" class="${modal === app.app_id ? 'active' : 'hidden'}">
      <div class="app-container">
        <img src="${xdcget_export + "/" + app.icon_relname}" loading="lazy" />
        <div class="metadata">
          <div class="title">${app.name}</div>
          <div class="description">
            <span class="subtitle">${subtitle}</span>
            <div class="date">Last updated ${dayjs(app.date).fromNow()}</div>
          </div>
        </div>
      </div>
      <div class="description-full">
        ${description}
      </div>
      <a href="${xdcget_export + "/" + app.cache_relname}" target="_blank">
        <button>Download</button>
      </a>
    </div>
  `;
};

const MainScreen = () => {
  /** @typedef {import('./app_list.d').AppList} AppList */
  /** @type {[AppList, (newState: AppList) => void]} */
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, viewModal] = useState(false); 

  useEffect(() => {
    (async () => {
      console.log(";");
      setApps(await (await fetch(xdcget_export + "/xdcget-lock.json")).json());
      setLoading(false);
    })();
  }, []);

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
  const [searchResults, setSearchResults] = useState();
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
  console.count('render');

  // This allows us to set/unset the modal for a particular app
  const toggleModal = (appID) => {
    if(appID) {
      viewModal(appID);
    } else {
      viewModal(false);
    }
  };

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
    <div id="app_container">
      ${loading && html`<div>Loading</div>`}
      ${searchResults &&
        searchResults.map((result) => html`<${App} app=${result.item} toggleModal=${toggleModal} />`)}
    </div>
    <div id="dialog_layer" class="dialogs">
      <div class="dialog-backdrop ${modal ? 'active' : 'hidden'}" onClick=${() => toggleModal(false)}>
        ${searchResults && 
          searchResults.map((result) => html`<${Dialog} app=${result.item} modal=${modal}/>`)}
      </div>
    </div>
  `;
};

window.onload = async () => {
  render(html`<${MainScreen} />`, window.apps);
};
