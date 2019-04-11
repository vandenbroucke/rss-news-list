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

/**
 * Generates markdown string of grouped news sources 
 * @param {Array} input_js Array of objects containing RSS news source information.
 */
function generate_news_list_markdown(input_js){
    let grouped_news_sources = groupBy(input_js,"src_name_short"),
        markdown_list ="";

    for (const [source_name_short, sources] of Object.entries(grouped_news_sources)) {
        
        markdown_list+= `* **${source_name_short}** | ${sources[0].src_name_long} (${sources[0].src_country})\n`;


        sources.forEach(s => {
            markdown_list+= `\t* [${s.name}](${s.URL}) \t \n`;
        });
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