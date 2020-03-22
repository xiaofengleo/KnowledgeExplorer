angular.module('rdfvis.services').factory('queryService', queryService);
queryService.$inject = ['settingsService'];

function queryService (settings) {
  var prefix = {
    'rdf':  "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    'rdfs': "http://www.w3.org/2000/01/rdf-schema#",
    'owl':  "http://www.w3.org/2002/07/owl#",
    'text': "http://jena.apache.org/text#",
  };

  function u (uri) {
    return '<' + uri + '>';
  }

  function header (prefixes) {
    h = '';
    for (var i = 0; i < prefixes.length; i++) {
      if (prefix[prefixes[i]]) h += 'PREFIX ' + prefixes[i] + ': ' + u(prefix[prefixes[i]]) + '\n';
      else console.log('prefix "' + prefixes[i] + '" not found');
    }
    return h;
  }

  /* TODO: fix language filter and exact match for bif*/
  function search (keyword, type, limit, offset) {
    //type = type || settings.searchClass.uri.value;
    limit = limit || settings.resultLimit;
    q  = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
         'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n';
    if (settings.endpoint.type == 'fuseki')
      q += 'PREFIX text: <http://jena.apache.org/text#>\n';
      q +='prefix dcterms: <http://purl.org/dc/terms/>\n'; 
      q +='prefix envri: <http://envri.eu/ns/>\n';
      q +='prefix foaf: <http://xmlns.com/foaf/0.1/>\n'; 
      q +='prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n'; 
      q +='prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n'; 
      q +='prefix skos: <http://www.w3.org/2004/02/skos/core#>\n'; 
      q +='prefix xml: <http://www.w3.org/XML/1998/namespace>\n';
      q +='prefix xsd: <http://www.w3.org/2001/XMLSchema#>\n';
      q +='PREFIX rm: <http://www.oil-e.net/ontology/envri-rm.owl#>\n';
      q +='PREFIX dc: <http://purl.org/dc/elements/1.1/>\n';
      q +='prefix context: <http://147.213.76.116:8080/marmotta/context/>\n';
      q +='prefix eosc: <http://eosc.eu/>\n';
      q +='prefix prov: <http://www.w3.org/ns/prov#>\n';
      q +='prefix orcid: <https://orcid.org/>\n';
      q +='prefix np: <http://www.nanopub.org/nschema#>\n';
      q +='prefix fair: <https://w3id.org/fair/principles/terms/>\n';
      q +='prefix icc: <https://w3id.org/fair/icc/terms/>\n';
      q +='prefix pav: <http://purl.org/pav/>\n';
      q +='prefix dct: <http://purl.org/dc/terms/>\n';
      q +='prefix sio: <http://semanticscience.org/resource/>\n';
      q +='prefix npx: <http://purl.org/nanopub/x/>\n';
      q +='prefix owl: <http://www.w3.org/2002/07/owl#>\n';
      q +='prefix schema: <http://schema.org/>\n';
      q +='prefix envriri: <http://envri.eu/RI/>\n';
      q +='PREFIX dc:     <http://purl.org/dc/elements/1.1/>\n';
      q +='PREFIX owl:    <http://www.w3.org/2002/07/owl#>\n';
      q +='PREFIX rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n';
      q +='PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>\n';
      q +='PREFIX foaf:   <http://xmlns.com/foaf/0.1/>\n';
      q +='PREFIX skos:   <http://www.w3.org/2004/02/skos/core#>\n';
      q +='PREFIX base:   <http://www.oil-e.net/ontology/oil-base.owl#>\n';
      q +='PREFIX rm:     <http://www.oil-e.net/ontology/envri-rm.owl#>\n';
      q +='PREFIX envri:  <http://www.envri.eu/community#>\n';
      q +='PREFIX actris: <http://www.envri.eu/community/actris#>\n';
      q +='PREFIX anaee:  <http://www.envri.eu/community/anaee#>\n';
      q +='PREFIX argo:   <http://www.envri.eu/community/euro-argo#>\n';
      q +='PREFIX eiscat: <http://www.envri.eu/community/eiscat#>\n';
      q +='PREFIX epos:   <http://www.envri.eu/community/epos#>\n';
      q +='PREFIX eudat:  <http://www.envri.eu/community/eudat#>\n';
      q +='PREFIX icos:   <http://www.envri.eu/community/icos#>\n';
      q +='PREFIX lter:   <http://www.envri.eu/community/lter-europe#>\n';
      q +='PREFIX sdn:    <http://www.envri.eu/community/seadatanet#>\n';

   q += 'SELECT DISTINCT ?uri ?label ?type ?tlabel WHERE {\n';
    q += '  { SELECT ?uri ?label WHERE {\n';
    q += '      ?uri <' + settings.labelUri + '> ?label . \n';
    //q += '      FILTER (lang(?label) = "'+ settings.lang + '")\n';
    if (keyword) {
      switch (settings.endpoint.type) {
        case 'virtuoso':
          q += '      ?label bif:contains "\'' + keyword + '\'" .\n';
          break;
        case 'fuseki':
	q += 'FILTER(regex(?label,  "' + keyword +'", "i")) .\n';
          q += '      ?uri text:query (<' + settings.labelUri + '> "' + keyword + '" '+ limit +') .\n';
          break;
        default:
          q += '      FILTER regex(?label, "' + keyword + '", "i")\n'
      }
    }
    q += '  } LIMIT ' + limit;
    if (offset) q += ' OFFSET ' + offset;
    q += '\n  }\n  OPTIONAL {\n';
    q += '  ?uri rdf:type ?type .\n';
    q += '  ?type <' + settings.labelUri + '> ?tlabel .\n';
    q += '  FILTER (lang(?tlabel) = "'+ settings.lang + '")\n}}';
console.log(q);

//alert('q:' + q);

    return q;
  }

  function getClasses (uri, limit, offset) {
    q  = 'SELECT DISTINCT ?uri ?label WHERE {\n';
    q += '  ' + u(uri) + ' a ?uri .\n';
    q += '  ?uri <' + settings.labelUri + '> ?label .\n';
    q += '  FILTER (lang(?label) = "'+ settings.lang + '")\n';
    q += '}'
    if (limit)  q+= ' limit ' + limit;
    if (offset) q+= ' offset ' + offset;
    return header(['rdfs']) + q;
  }

  function getProperties (uri) {
    return 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
           'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
           'PREFIX owl: <http://www.w3.org/2002/07/owl#>\n' +
           'PREFIX bd: <http://www.bigdata.com/rdf#>\n' +
           //'PREFIX wikibase: <http://wikiba.se/ontology#>\n' +
           'SELECT DISTINCT ?property ?propertyLabel ?kind WHERE {\n' +
           '  <' + uri + '> ?property [] .\n' +
           // This is for wikidata only
           //'  ?p wikibase:directClaim ?property .\n' +
           //'  OPTIONAL { ?p <' + settings.labelUri + '> ?propertyLabel . FILTER (lang(?propertyLabel) = "'+
           //settings.lang + '")}\n' +
           '  OPTIONAL { ?property <' + settings.labelUri + '> ?propertyLabel . FILTER (lang(?propertyLabel) = "'+ settings.lang + '")}\n' +
           '  BIND(\n' +
           '    IF(EXISTS { ?property rdf:type owl:ObjectProperty},\n' +
           '      1,\n' +
           '      IF(EXISTS {?property rdf:type owl:DatatypeProperty},\n' +
           '        2,\n' +
           '        0))\n' +
           '    as ?kind)\n' +
           '}';
  }

  function countValuesType (uri, prop) {
    return 'SELECT (sum(?u) as ?uris) (sum(?l) as ?lits) WHERE {\n' + 
           '  <' + uri + '> <' + prop + '> ?o .\n' +
           '  BIND(IF(ISURI(?o),1,0) AS ?u)\n' +
           '  BIND(IF(!ISURI(?o),1,0) AS ?l)\n}';
  }

  function getPropUri (uri, prop) {
    return 'SELECT ?uri WHERE {\n' + 
           '  <' + uri + '> <' + prop + '> ?uri .\n}'
  }

  function getPropObject (uri, prop) {
    return 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
           'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
           'SELECT DISTINCT ?uri ?uriLabel WHERE {\n' +
           '  <' + uri + '> <' + prop + '> ?uri .\n' +
           '  OPTIONAL { ?uri <' + settings.labelUri + '> ?uriLabel . FILTER (lang(?uriLabel) = "' + settings.lang + '")}\n}';
  }

  function getPropDatatype (uri, prop) {
    return 'SELECT DISTINCT ?lit WHERE {\n' +
           '  <' + uri + '> <' + prop + '> ?lit .\n' +
           '  FILTER (lang(?lit) = "" || lang(?lit) = "' + settings.lang + '")\n}'
  }

  return {
    search: search, 
    getProperties: getProperties,
    getClasses: getClasses,
    countValuesType: countValuesType,
    getPropUri: getPropUri,
    getPropObject: getPropObject,
    getPropDatatype: getPropDatatype,
  };
}
