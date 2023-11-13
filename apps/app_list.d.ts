export type AppEntry = {
    app_id: string,
    tag_name: string,
    url: string,
    date: string,
    description: string,
    source_code_url: string,
    name: string,
    cache_relname: string,
    icon_relname: string,
}

export type AppList = AppEntry[]