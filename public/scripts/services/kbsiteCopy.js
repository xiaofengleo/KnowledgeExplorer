/* kb-site.js
 * Provides functions for querying SPARQL endpoints and producing tables and network graphs from the results.
 * Requires: D3.js (v5) [https://d3js.org/d3.v5.min.js]
 * Paul Martin 11/5/18
*/

/* transform to angular compatible
 * as a service
 * Xiaofeng Liao, 8 Mar, 2020
*/


angular.module('rdfvis.services').factory('netGraph',netGraph);
netGraph.$inject = ['settingsService'];

function netGraph (settings) {

// The set of physics simulations maintained for all concurrent graphs.
var simulations = {};

// The colour scheme for graph nodes.
//var color = d3.scaleOrdinal(d3.schemeCategory10);

/* Asynchronously submit a SPARQL SELECT query to an end-point.
 *   query : the SPARQL query to submit.
 *   endpoint : the SPARQL end-point to submit to.
 *   target : the HTML element to write the results to. */
function sparqlSelectQuery(query, endpoint, target) {
    // Construct the request and initialise the response string.
    var parameters = "query=" + encodeURI(query);
    var request = new XMLHttpRequest();
    var response = "";

    // Set up a POST request with JSON response.
    request.open('POST', endpoint, true);
    request.onreadystatechange = function() {
        // Get response and build visualisation (table).
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log(this.responseText);
                try {
                    response = JSON.parse(this.responseText);
                    displayTableJson(response, target);
                } catch (err) {
                    displaySelectError(target);
                }
            } else {
                alert("Error in response: " + request.status + " " +
                      request.responseText);
            }
        }
    };
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.setRequestHeader("Accept", "application/sparql-results+json");
    request.send(parameters);
}

function displaySelectError(target) {
    document.getElementById(target).innerHTML = "Unable to parse the response from the Knowledge Base. Was the submitted query a well-formed SELECT query?";
}

/* Asynchronously submit a SPARQL CONSTRUCT query to an end-point.
 *   query : the SPARQL query to submit.
 *   endpoint : the SPARQL end-point to submit to.
 *   svg : the HTML SVG element to draw the results graph on.
 *   table : the HTML element to write information about selected graph nodes to. */
function sparqlConstructQuery(query, endpoint, svg, table) {
    // Construct the request and initialise the response string.
    var parameters = "query=" + encodeURI(query);
    var request = new XMLHttpRequest();
    var response = "";
    var quads = [];

    // Set up a POST request with JSON-LD response.
    request.open('POST', endpoint, true);
    request.onreadystatechange = function() {
        // Get response and build visualisation (graph).
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    response = JSON.parse(this.responseText);
                    displayGraphJson(response, endpoint, svg, table);
                } catch (err) {
                    displayConstructError(table);
                }
            } else {
                alert("Error in response: " + request.status + " " +
                      request.responseText);
            }
        }
    };
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.setRequestHeader("Accept", "application/ld+json");
    request.send(parameters);
}

function displayConstructError(target) {
    document.getElementById(target).innerHTML = "Unable to parse the response from the Knowledge Base. Was the submitted query a well-formed CONSTRUCT query?";
}

/* Display a tabular view of parsed JSON.
 *   object : the JSON object describing the results of a SELECT SPARQL query.
 *   target : the HTML element to write the results to. */
function displayTableJson(object, target) {
    // Initialise the table HTML element and start extracting JSON content.
    var content = "<table>",
        results = object.results.bindings,
        keys = object.head.vars,
        i, j, entry, empty = true;

    if (results.length == 0) {
        // No information available.
        content += "<tr><td><i>No detailed information available.</i></td></tr>";
    } else if (results.length == 1) {
        // Build a reduced table for a single (detailed?) entry.
        for (j in keys) {
            entry = results[0][keys[j]];
            if (entry !== undefined) {
                empty = false;
                content += "<tr><td><b>" + keys[j] + "</b></td><td>" + results[0][keys[j]].value + "</td></tr>";
            }
        }
        if (empty) content += "<tr><td><i>No detailed information available.</i></td></tr>";
    } else {
        // Build table from results with keys.
        content += "<tr>";
        for (j in keys) {
            content += "<th>" + keys[j] + "</th>";
        }
        content += "</tr>";
        for (i in results) {
            content += "<tr>";
            for (j in keys) {
                entry = results[i][keys[j]];
                if (entry === undefined) {
                    content += "<td></td>";
                } else {
                    content += "<td>" + results[i][keys[j]].value + "</td>";
                }
            }
            content += "</tr>"
        }
    }
    content += "</table>"

    // Display table over target HTML element.
    document.getElementById(target).innerHTML = content;
}

/* Display a graph representation of parsed JSON.
 *   object : the JSON-LD object describing the results of a CONSTRUCT SPARQL query.
 *   endpoint : the SPARQL end-point that was submitted to.
 *   svg : the HTML SVG element to draw the results graph on.
 *   table : the HTML element to write information about selected graph nodes to. */function displayGraphJson(object, endpoint, svg, table) {
    // Initialise the visualisation graph and start extracting JSON-LD content.
    var data = { nodes: [], links: [] },
        entityList = [],
        construction = object['@graph'],
        context = object['@context'],
        propertyCount = 0;

    console.log(object);

    // JSON-LD graphs with a single subject don't wrap it in a @graph element.
    if (construction === undefined) construction = [object];
 
    // Add extra information about namespace prefixes to the JSON-LD @context element to make it easier to link properties with their specifications later.
    for (elem in context) {
        let prefix = "";
        // Work out what namespace is associated with each property used in the graph.
        if (typeof context[elem] !== "string") {
            // Filter out the namespace declarations; only want properties at first.
            prefix = context[elem]["@id"];
            if (prefix !== undefined) {
                // Namespaces end in '#' or '/'.
                let separationPoint = prefix.indexOf("#");
                if (separationPoint == -1)
                    separationPoint = prefix.lastIndexOf("/");
                prefix = prefix.slice(0, separationPoint + 1);
                for (elem2 in context) {
                    if (elem2 == "@vocab") {
                        continue; // Skip this case.
                    } else if (context[elem2] === prefix) {
                        context[elem].prefix = elem2
                        break; // Finish this search.
                    }
                }
            }
        }
    }

    // Build the graph from the JSON-LD.
    for (i = 0; i < construction.length; i++) {
        let entity = construction[i]["@id"], index;
        // Need a node for every subject in the JSON-LD.
        if (!entityList.includes(entity)) {
            data.nodes.push({ id: entity, title: entity, group: 0 });
            index = entityList.push(entity) - 1;
        } else {
            index = entityList.indexOf(entity);
        }
        // Examine each entry in the JSON-LD in turn to learn more.
        for (j in construction[i]) {
            if (j === "@id" || j === "@context") {
                continue; // Ignore @ids (already checked) and @context elements.
            } else if (j === "@type") {
                // If @type information is provided, extract it.
                let type = construction[i]["@type"];
                if (Array.isArray(type)) {
                    // If there are multiple types, treat as an individual.
                    data.nodes[index].group = 2;
                } else if (type === "owl:Class")
                    data.nodes[index].group = 1;
                else if (type === "owl:NamedIndividual")
                    data.nodes[index].group = 2;
                else if (type === "owl:ObjectProperty")
                    data.nodes[index].group = 3;
                else if (type === "owl:DataProperty")
                    data.nodes[index].group = 4;
            } else {
                // Look at every property for every subject in turn.
                let pIndex, fullName, pPrefix;
                    pId = j + propertyCount;

                if (context[j] !== undefined) pPrefix = context[j].prefix;
                // Because properties nodes are not unique, use a counter to differentiate different uses of the same property.
                propertyCount++;
                // Attach the namespace to the property label where available.
                if (pPrefix === undefined)
                    pPrefix = "null"; // Just in case.
                fullName = pPrefix + ":" + j;
                // Create an intermediary node for every property encountered.
                if(!entityList.includes(pId)) {
                    data.nodes.push({ id: pId, title: fullName, group: 3 });
                    pIndex = entityList.push(pId) - 1;
                } else {
                    pIndex = entityList.indexOf(pId);
                }
                data.links.push({ source: entity, target: pId });
                // Link to every object; create new nodes for objects where needed.
                let values = construction[i][j];
                if (Array.isArray(values)) {
                    // If a property has several objects, check them all.
                    for (k = 0; k < values.length; k++) {
                        if (typeof values[k]["@value"] === "string") {
                            // If a property is a data property, create a data node.
                            let dId = "data" + propertyCount;
                            propertyCount++;
                            data.nodes.push({ id: dId, title: values[k]["@value"], group: 5 });
                            data.links.push({ source: pId, target: dId });
                        } else if (typeof values[k] === "number") {
                            let dId = "data" + propertyCount;
                            propertyCount++;
                            data.nodes.push({ id: dId, title: values[k], group: 5 });
                            data.links.push({ source: pId, target: dId });
                        } else {
                            if (!entityList.includes(values[k])) {
                                let group = (values[k].split(":").length == 1) ? 5 : 0;
                                data.nodes.push({ id: values[k], title: values[k], group: group });
                                entityList.push(values[k]);
                            }
                            data.links.push({ source: pId, target: values[k] });
                        }
                    }
                } else if (typeof values === "string") {
                    // If a property has only one object, check that.
                    if (!entityList.includes(values)) {
                        let group = (values.split(":").length == 1) ? 5 : 0;
                        data.nodes.push({ id: values, title: values, group: group });
                        entityList.push(values);
                    }
                    data.links.push({ source: pId, target: values });
                } else if (typeof values === "number") {
                    // If a numeric data property...
                    let dId = "data" + propertyCount;
                    propertyCount++;
                    data.nodes.push({ id: dId, title: values, group: 5 });
                    data.links.push({ source: pId, target: dId });
                } else if (typeof values["@value"] === "string") {
                    // If a property is a data property, create a data node.
                    let dId = "data" + propertyCount;
                    propertyCount++;
                    data.nodes.push({ id: dId, title: values["@value"], group: 5 });
                    data.links.push({ source: pId, target: dId });
                }
            }
        }
    }

    // Add extra metadata to nodes.
    for (i = 0; i < data.nodes.length; i++) {
        data.nodes[i].endpoint = endpoint;
        data.nodes[i].table = table;
        data.nodes[i].visualiser = svg;
    }

    console.log(data.nodes);
    console.log(data.links);

    // Create the visualistion using D3.
    updateVisualiser(svg, data);
}

/* Draws an interactive graph based on the processed results from displayGraphJson.
 *   visualiser : the name of the SVG element to draw the graph to.
 *   endpoint : the SPARQL end-point that was submitted to.
 *   data : the transformed graph data to visualise.
 *   table : the HTML element to write information about selected graph nodes to. */
function updateVisualiser(visualiser, data) {
    // Select the SVG element (via D3) and get its dimensions.
    var svg = d3.select("svg#"+visualiser),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    // Select the SVG element (via DOM).
    var source = document.getElementById(visualiser);

    // Reset the SVG element (if necessary) and make visable.
    source.innerHTML = "";
    source.style.display = "inline";

    // Draw the edges.
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .style("stroke-width", function(d) { return 2 * d.value; })
        .style("stroke", "rgb(0,0,0)")
        .style("stroke-opacity", 0.3);

    // Draw the node labels.
    var text = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(data.nodes)
        .enter().append("text")
        .attr("fill", "black")
        .style("font-size", 11)
        .text(function(d) { return d.title; });

    // Draw the nodes and add listeners for drag events.
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("r", function(d) { return size(d.group); })
        .attr("fill", function(d) { return color(d.group); })
        .attr("fill-opacity", 0.5)
        .on("click", clickedNode)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Configure the physics simulation for this graph.
    simulations[visualiser] = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(90))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Obtain a label for every node.
    node.append("title")
        .text(function(d) { return d.title; });

    // Register the nodes with the simulation and set the update listener.
    simulations[visualiser]
        .nodes(data.nodes)
        .on("tick", ticked);

    // Register the links with the simulation.
    simulations[visualiser].force("link")
        .links(data.links);

    // Define the update function for animated nodes and links.
    function ticked() {
        // Ensure that nodes don't drift out of sight within the SVG element.
        node
            .attr("cx", function(d) { return d.x = Math.max(0, Math.min(width, d.x)); })
            .attr("cy", function(d) { return d.y = Math.max(0, Math.min(height, d.y)); });

        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        text
            .attr("x", function(d) { return d.x })
            .attr("y", function(d) { return d.y });
    }

    function size(group) {
        switch (group) {
            case 1: return 30;
            case 2: return 30;
            case 3: return 10;
            case 4: return 10;
            case 5: return 20;
            default: return 30;
        }
    }
}

// Function called when a drag event on a node begins.
function dragstarted(d) {
  if (!d3.event.active) simulations[d.visualiser].alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

// Function called as a drag event on a node continues.
function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

// Function called when a drag event on a node finishes.
function dragended(d) {
  if (!d3.event.active) simulations[d.visualiser].alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

/* When a node is selected, produce a table of annotations associated with the entity.
 *   d : the entity in the graph selected.
 *   i : the index of the selected entity in the entity list (unused). */
function clickedNode(d, i) {
    // Provide a visual indicator of the selection.
    var entity = d3.select(this);
    var radius = entity.attr("r");

    entity.transition()
        .attr("r", radius * 2)
        .transition()
            .attr("r", radius)
            .style("fill", function(d) { return color(d.group); });

    if (d.group == 5) {
        // Data elements cannot be expanded on further.
        document.getElementById(d.table).innerHTML
                = "<table><tr><td><b>description</b></td><td>" + d.title + "</td></tr></table>";
        return;
    }
    var segments = d.title.split(":");
    if (segments[0] != "null") {
        // Only send a query if the namespace has been correctly identified.
        let entity = d.title;
        if (segments.length < 2 || segments[0] == "http" || segments[0] == "https") {
            // Properly enclose raw URIs.
            entity = "<" + entity + ">";
        }
        // The standard query for getting annotation data.
        var query = `${document.getElementById('namespaces').value} SELECT DISTINCT ?property ?data WHERE { ?property a owl:AnnotationProperty . ${entity} ?property ?data . FILTER NOT EXISTS { ?subProperty rdfs:subPropertyOf ?property . ${entity} ?subProperty ?data . FILTER (?subProperty != ?property) } . }`;

        // Make a SELECT query to produce a table at the designated part 
        sparqlSelectQuery(query, d.endpoint, d.table);
    } else {
        // Default to just showing the title string.
        document.getElementById(d.table).innerHTML
                = "<table><tr><td><b>description</b></td><td>" + d.title + "</td></tr></table>";
    }
}

}

