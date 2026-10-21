const   fs = require('fs'),
        json2yaml = require('json2yaml'),
        json2csv = require('json2csv').Parser,
        json2csvParser = new json2csv(),
        json2xml = require('xml-js'),
        template_format = require("string-template");

// File paths
const   input_path = "./data/root.json",
        output_file_name="news_list",
        output_path="./data/",
        input_template_path="./docs/template.md",
        output_template_path="./README.md";

/**
 * Helper function for grouping array objects
 */
const  groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

/**
 *  Converts a given json dataset to [YAML,CSV,XML] and writes it as seperate files
 * @param {Array} input_js Array of objects containing RSS news source information.
 */


function generate_data_files(input_js){
    let JSON_data = JSON.stringify(input_js),
        YAML_data = json2yaml.stringify(input_js),
        CSV_data = json2csvParser.parse(input_js),
        XML_data = json2xml.js2xml(input_js,{compact: true, ignoreComment: true, spaces: 4});    

    let filePath = output_path+output_file_name;

    fs.writeFile(filePath+".json",JSON_data,write_file_cb);
    fs.writeFile(filePath+".yml",YAML_data,write_file_cb);
    fs.writeFile(filePath+".csv",CSV_data,write_file_cb);
    fs.writeFile(filePath+".xml",XML_data,write_file_cb);
}

/**
 * Write callback function for simple file write output.
 * @param {Object} err Error object returned from callback if writing of the file did not succeed.
 */
function write_file_cb(err){
    if (err) throw err;
}

// Readable names and ISO 3166-1 alpha-2 codes (used for the flag emoji) for the alpha-3 codes used in the list.
// Unknown codes fall back to the code itself, without a flag.
const countries = {
    AUS: { name: "Australia", alpha2: "AU" },
    AUT: { name: "Austria", alpha2: "AT" },
    BEL: { name: "Belgium", alpha2: "BE" },
    CAN: { name: "Canada", alpha2: "CA" },
    CHE: { name: "Switzerland", alpha2: "CH" },
    CZE: { name: "Czechia", alpha2: "CZ" },
    DEU: { name: "Germany", alpha2: "DE" },
    DNK: { name: "Denmark", alpha2: "DK" },
    ESP: { name: "Spain", alpha2: "ES" },
    FIN: { name: "Finland", alpha2: "FI" },
    FRA: { name: "France", alpha2: "FR" },
    GBR: { name: "United Kingdom", alpha2: "GB" },
    GRC: { name: "Greece", alpha2: "GR" },
    HUN: { name: "Hungary", alpha2: "HU" },
    IND: { name: "India", alpha2: "IN" },
    IRL: { name: "Ireland", alpha2: "IE" },
    ITA: { name: "Italy", alpha2: "IT" },
    JPN: { name: "Japan", alpha2: "JP" },
    NLD: { name: "Netherlands", alpha2: "NL" },
    NOR: { name: "Norway", alpha2: "NO" },
    POL: { name: "Poland", alpha2: "PL" },
    PRT: { name: "Portugal", alpha2: "PT" },
    QAT: { name: "Qatar", alpha2: "QA" },
    ROU: { name: "Romania", alpha2: "RO" },
    RUS: { name: "Russia", alpha2: "RU" },
    SGP: { name: "Singapore", alpha2: "SG" },
    SRB: { name: "Serbia", alpha2: "RS" },
    SWE: { name: "Sweden", alpha2: "SE" },
    UKR: { name: "Ukraine", alpha2: "UA" },
    USA: { name: "United States", alpha2: "US" },
    ZAF: { name: "South Africa", alpha2: "ZA" }
};

/**
 * Returns the title of a country, for example: United Kingdom (GBR)
 * @param {String} country_code ISO 3166-1 alpha-3 Country code.
 */
function country_title(country_code){
    return countries[country_code] ? `${countries[country_code].name} (${country_code})` : country_code;
}

/**
 * Returns the title of a country prefixed with its flag emoji, for example: 🇬🇧 United Kingdom (GBR)
 * The flag is built from the two regional indicator symbols matching the alpha-2 code.
 * @param {String} country_code ISO 3166-1 alpha-3 Country code.
 */
function country_heading(country_code){
    if (!countries[country_code]) return country_title(country_code);

    let flag = [...countries[country_code].alpha2]
        .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
        .join("");
    return `${flag} ${country_title(country_code)}`;
}

/**
 * Converts a heading title to the anchor GitHub generates for it.
 * Emoji are dropped but their trailing space is kept, so "🇬🇧 United Kingdom (GBR)" becomes "-united-kingdom-gbr".
 * @param {String} title Heading title.
 */
function heading_anchor(title){
    return title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,"").replace(/\s/g,"-");
}

/**
 * Makes text safe to use inside a markdown table cell.
 * @param {String} text Cell text.
 */
function table_cell(text){
    return text.trim().replace(/\|/g,"\\|");
}

/**
 * Groups news sources by country, sorted by country title.
 * @param {Array} input_js Array of objects containing RSS news source information.
 * @returns {Array} [country_code, sources] pairs.
 */
function group_by_country(input_js){
    return Object.entries(groupBy(input_js,"src_country"))
        .sort(([a],[b]) => country_title(a).localeCompare(country_title(b)));
}

/**
 * Generates a markdown table body with the number of sources and feeds per country.
 * @param {Array} input_js Array of objects containing RSS news source information.
 */
function generate_country_overview_markdown(input_js){
    return group_by_country(input_js).map(([country_code, sources]) => {
        let title = country_heading(country_code),
            source_count = Object.keys(groupBy(sources,"src_name_short")).length;
        return `| [${title}](#${heading_anchor(title)}) | ${source_count} | ${sources.length} |`;
    }).join("\n");
}

/**
 * Generates markdown string of news sources grouped by country, with a collapsible feed table per source.
 * @param {Array} input_js Array of objects containing RSS news source information.
 */
function generate_news_list_markdown(input_js){
    let markdown_list ="";

    for (const [country_code, country_sources] of group_by_country(input_js)) {
        markdown_list+= `### ${country_heading(country_code)}\n\n`;

        for (const [source_name_short, sources] of Object.entries(groupBy(country_sources,"src_name_short"))) {
            let feed_label = sources.length === 1 ? "feed" : "feeds";

            markdown_list+= `<details>\n<summary><b>${source_name_short.trim()}</b> · ${sources[0].src_name_long.trim()} (${sources.length} ${feed_label})</summary>\n\n`;
            markdown_list+= "| Feed | URL |\n|------|-----|\n";

            sources.forEach(s => {
                markdown_list+= `| ${table_cell(s.name)} | ${s.URL} |\n`;
            });

            markdown_list+= "\n</details>\n\n";
        }
    }

    return markdown_list;
}

/**
 * Processes an array of news sources to provide metrics and format into a readable documentation file.
 * @param {Array} input_js Array of objects containing RSS news source information.
 */
function generate_documentation(input_js){
    let [URL_count,source_count] = get_metrics_from_list(input_js);
    let template_text ="";
    //Load in template documentation.
    fs.readFile(input_template_path,"utf-8",function(err,t_text){
        if(err)throw err;    
        template_text = t_text;
        
        let filled_text =  template_format(template_text,{
            URL_count:URL_count,
            source_count:source_count,
            country_count:group_by_country(input_js).length,
            country_overview:generate_country_overview_markdown(input_js),
            news_list:generate_news_list_markdown(input_js)
        })            

        fs.writeFile(output_template_path,filled_text,write_file_cb);
    });
}

/**
 * Will count the number of distinct news sources 
 * @param {Array} input_js  Array of objects containing RSS news source information.
 * @returns {Array} [0] => Count of unqiue URLS,[1] => count of unique sources by src_name_short.
 */
function get_metrics_from_list(input_js){
    const source_names = input_js.map(s => s["src_name_short"]);
    let unique_sources = source_names.filter(function (value, index, self) {
        return self.indexOf(value) === index;
      });
    return [source_names.length,unique_sources.length]
}

//Read in the input data and start conversion if there were no errors
fs.readFile(input_path,function(err,root_data){
    if(err)throw err;    
    let json_root_data =  JSON.parse(root_data);
    generate_data_files(json_root_data);
    generate_documentation(json_root_data);
});