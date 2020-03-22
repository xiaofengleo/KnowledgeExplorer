angular.module('rdfvis.services').factory('settingsService', settingsService);
settingsService.$inject = [];

function settingsService () {
  var settings = {
    lang: 'en',
    labelUri: "http://www.w3.org/2000/01/rdf-schema#label",
    endpoint: {
      //url: "https://dbpedia.org/sparql",
     // url: "http://90.147.102.53/ontosparql",
	url: "http://banach.vlan400.uvalight.net:3030/actris/query",
      //type: "virtuoso",
      type: "fuseki",
      //label: "wikidata",
      label: "ontowiki",
    },
    resultLimit: 20,
  }

  settings.default = Object.assign({}, settings ); 
  settings.prefixes = [
    {prefix: 'rdf',       uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#"},
    {prefix: 'owl',       uri: "http://www.w3.org/2002/07/owl#"},
    {prefix: 'text',      uri: "http://jena.apache.org/text#"},
    {prefix: 'wds',       uri: "http://www.wikidata.org/entity/statement/"},
    {prefix: 'wd',        uri: "http://www.wikidata.org/entity/"},
    {prefix: 'wdv',       uri: "http://www.wikidata.org/value/"},
    {prefix: 'wikibase',  uri: "http://wikiba.se/ontology#"},
    {prefix: 'psvn',      uri: "http://www.wikidata.org/prop/statement/value-normalized/"},
    {prefix: 'ps',        uri: "http://www.wikidata.org/prop/statement/"},
    {prefix: 'pqv',       uri: "http://www.wikidata.org/prop/qualifier/value/"},
    {prefix: 'pq',        uri: "http://www.wikidata.org/prop/qualifier/"},
    {prefix: 'wdt',       uri: "http://www.wikidata.org/prop/direct/"},
    {prefix: 'p',         uri: "http://www.wikidata.org/prop/"},
    {prefix: 'rdfs',      uri: "http://www.w3.org/2000/01/rdf-schema#"},
    {prefix: 'bd',        uri: "http://www.bigdata.com/rdf#"},
    {prefix: 'dbc',       uri: "http://dbpedia.org/resource/Category:"},
    {prefix: 'dbo',       uri: "http://dbpedia.org/ontology/"},
    {prefix: 'dbp',       uri: "http://dbpedia.org/property/"},
    {prefix: 'dbt',       uri: "http://dbpedia.org/resource/Template:"},
    {prefix: 'dbr',       uri: "http://dbpedia.org/resource/"},
    {prefix: 'dc',        uri: "http://purl.org/dc/elements/1.1/"},
    {prefix: 'dct',       uri: "http://purl.org/dc/terms/"},
    {prefix: 'foaf',      uri: "http://xmlns.com/foaf/0.1/"},
    {prefix: 'yago',      uri: "http://dbpedia.org/class/yago/"},
    {prefix: 'wiki-commons', uri: "http://commons.wikimedia.org/wiki/"},
    {prefix: 'umbel',     uri: "http://umbel.org/umbel#"},
    {prefix: 'umbel-ac',  uri: "http://umbel.org/umbel/ac/"},
    {prefix: 'umbel-rc',  uri: "http://umbel.org/umbel/rc/"},
    {prefix: 'umbel-sc',  uri: "http://umbel.org/umbel/sc/"},
    {prefix: 'dul',       uri: "http://www.ontologydesignpatterns.org/ont/dul/DUL.owl"},
    {prefix: 'schema',    uri: "http://schema.org/"},
    {prefix: 'vrank',     uri: "http://purl.org/voc/vrank#"},
    {prefix: 'skos',      uri: "http://www.w3.org/2004/02/skos/core#"},
    {prefix: 'prov',      uri: "http://www.w3.org/ns/prov#"},
{PREFIX: 'rdfs',   uri: "http://www.w3.org/2000/01/rdf-schema#"},
{PREFIX: 'base', uri: "http://www.oil-e.net/ontology/oil-base.owl#"},
{PREFIX: 'rm',   uri: "http://www.oil-e.net/ontology/envri-rm.owl#"},
{PREFIX: 'envri', uri: "http://www.envri.eu/community#"},
{PREFIX: 'actris',  uri: "http://www.envri.eu/community/actris#"},
{PREFIX: 'anaee', uri: "http://www.envri.eu/community/anaee#"},
{PREFIX: 'argo',  uri: "http://www.envri.eu/community/euro-argo#"},
{PREFIX: 'eiscat', uri: "http://www.envri.eu/community/eiscat#"},
{PREFIX: 'epos', uri: "http://www.envri.eu/community/epos#"},
{PREFIX: 'eudat', uri: "http://www.envri.eu/community/eudat#"},
{PREFIX: 'icos', uri: "http://www.envri.eu/community/icos#"},
{PREFIX: 'lter', uri: "http://www.envri.eu/community/lter-europe#"},
{PREFIX: 'sdn',  uri: "http://www.envri.eu/community/seadatanet#"},
{PREFIX: 'dcterms', uri: "http://purl.org/dc/terms/"},
{PREFIX: 'envri', uri: "http://envri.eu/ns/"},
{PREFIX: 'xml', uri: "http://www.w3.org/XML/1998/namespace"},
{PREFIX: 'xsd', uri: "http://www.w3.org/2001/XMLSchema#"},
{PREFIX: 'context', uri: "http://147.213.76.116:8080/marmotta/context/"},
{PREFIX: 'eosc', uri: "http://eosc.eu/"},
{PREFIX: 'prov', uri: "http://www.w3.org/ns/prov#"},
{PREFIX: 'orcid', uri: "https://orcid.org/"},
{PREFIX: 'np', uri: "http://www.nanopub.org/nschema#"},
{PREFIX: 'fair', uri: "https://w3id.org/fair/principles/terms/"},
{PREFIX: 'icc', uri: "https://w3id.org/fair/icc/terms/"},
{PREFIX: 'pav', uri: "http://purl.org/pav/"},
{PREFIX: 'dct', uri: "http://purl.org/dc/terms/"},
{PREFIX: 'sio', uri: "http://semanticscience.org/resource/"},
{PREFIX: 'npx', uri: "http://purl.org/nanopub/x/"},
{PREFIX: 'schema', uri: "http://schema.org/"},
{PREFIX: 'envriri', uri: "http://envri.eu/RI/"},
{PREFIX: 'fairterms', uri: "https://w3id.org/fair/principles/terms/"},  
];

  // selected = {uri: '', object: [], datatype: [], text: [], extra: [], image: [], values: {}},
  settings.describe = {
    exclude: [
      "http://www.wikidata.org/prop/direct/P443", //pronuntiation
      "http://www.wikidata.org/prop/direct/P109", //signature
    ],
    objects: ["http://www.wikidata.org/prop/direct/P31"],
    datatype: [],
    text: ["http://dbpedia.org/ontology/abstract"],
    image: [
      "http://dbpedia.org/ontology/thumbnail",
      "http://www.wikidata.org/prop/direct/P18",  //thumbnail
      "http://www.wikidata.org/prop/direct/P154", //logo
      "http://www.wikidata.org/prop/direct/P41",  //flag
      "http://www.wikidata.org/prop/direct/P94",  //coat of arms
      "http://www.wikidata.org/prop/direct/P158", //seal
      "http://www.wikidata.org/prop/direct/P242", //map
      "http://www.wikidata.org/prop/direct/P948", //banner
    ],
    external: [
      "http://www.wikidata.org/prop/direct/P2035",
      "http://www.wikidata.org/prop/direct/P2888",
      "http://www.wikidata.org/prop/direct/P973",
      "http://www.wikidata.org/prop/direct/P856",
      "http://www.wikidata.org/prop/direct/P3264",
      "http://www.wikidata.org/prop/direct/P1896",
      "http://www.wikidata.org/prop/direct/P1581",
    ],
  }

  return settings;
}
