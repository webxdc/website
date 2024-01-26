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
const App = ({ app }) => {
  const [subtitle, description] = [app.description.split('\n').shift(), app.description.split('\n').slice(1).join(' ')];
  return html`
    <a
      class="app"
      href=${xdcget_export + "/" + app.cache_relname}
      target="_blank"
      tabindex="0"
    >
      <img src=${xdcget_export + "/" + app.icon_relname} loading="lazy" />
      <div class="props">
        <div class="title">${app.name}</div>
        <div class="description">
          <span class="subtitle">${subtitle}</span></div>
        <div class="date">Last updated ${dayjs(app.date).fromNow()}</div>
      </div>
    </a>
  `;
};

const MainScreen = () => {
  /** @typedef {import('./app_list.d').AppList} AppList */
  /** @type {[AppList, (newState: AppList) => void]} */
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

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
  console.count('render')

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
      searchResults.map((result) => html`<${App} app=${result.item} />`)}
    </div>
  `;
};

window.onload = async () => {
  render(html`<${MainScreen} />`, window.apps);
};
