
var LEWCID_KEYBOARD = {
    packing:{
        length:(42*5*2),
        width:1,
        order:["char","col","line","SHFT"],
        index_mult:[0,1,42,(5*42)],
    },
    "axes":{
        "col":{mod:42,count:42},
        "line":{pack:42,mod:5,count:5},
        "SHFT":{pack:(42*5),count:2},
        "char":{array:"" +
"`  1  2  3  4  5  6  7  8  9  0  -  = DEL\n"+     
"TAB q  w  e  r  t  y  u  i  o  p  [  ]  \\\n"+     
"CAP  a  s  d  f  g  h  j  k  l  ;  '  # R\n"+    
"SFT   z  x  c  v  b  n  m  ,  .  /  ↑ SFT\n"+    
"c  o  a  ____________________ c o ← ↓ →  \n"+
"~  !  @  #  $  %  ^  &  *  (  )  _  + del\n"+
"tab Q  W  E  R  T  Y  U  I  O  P  {  }  |\n"+    
"cap  A  S  D  F  G  H  J  K  L  :  \"  # ┘\n"+     
"sft   Z  X  C  V  B  N  M  <  >  ?  ↑ sft\n"+   
"c  o  a  ____________________ c o ← ↓ →  \n"+
""}},
};

function keyboard_check(idea) {
    var data = idea.axes.char.array;
    var start = 0;
    for (var nextIndex = data.indexOf("\n",start); nextIndex >= 0; nextIndex = data.indexOf("\n",nextIndex+1)) {
        console.log(nextIndex + " : " + ((1+nextIndex) / 50));
    }
    return;
}
keyboard_check(LEWCID_KEYBOARD);

var LEWCID_FONT = LEWCID_FONT_BASIC; // !!! EXTERNAL !!!!
/*
    "axes":{
        "x":{mod:8},
        "y":{pack:8,mod:16},
        "char":{pack:(8*16)},
        "opacity":{array:[
*/

var LEWCID_CONSOLE_BUFFER = {
    "axes":{
        "row":{mod:12},  // index%12
        "col":{pack:12}, // (index/12)
        "char":{array:"Hello World.New Line."}
    },
};


var LEWCID_OPACITY_BUFFER = {
    "axes":{
        "x":{mod:(8*12),count:(8*12)},
        "y":{pack:(8*12),count:(16*2)},
        "opacity":{
        },
    },
};

// dimension attributes:
//
//  var address = ( ( ( ( index + pre_offset ) / pack ) % mod ) + post_offset );
//  if (count)
//    return percepts[ address ... (address + count) ]
//  else
//    return address

function concept_value_by_index(concept,index) {
    var address = index;
    if (concept.pack) {
        var offset = address % concept.pack;
        address = ((address - offset) / concept.pack);
    }
    if (concept.mod)
        address %= concept.mod;
    if (concept.array) {
        return concept.array[ address ];
    } else {
        return address;
    }
}

function idea_packing_ensure(idea) {

    if (idea.packing) return idea.packing;

    idea.packing = {};

}

function idea_index_by_values(idea,values) {
    var index = 0;
    for (var vi in values) {
        var concept = idea.axes[vi];
        if (concept) {
            if (concept.array) {
                //throw "This is tricky.";
            } else {
                var val = values[vi];
                if (concept.mod)
                    val = val % concept.mod;
                if (concept.pack)
                    val = val * concept.pack;
                index += val;
            }
        }
    }
    return index;
}

function idea_max_indices(idea) {
    var dims = idea.axes;
    var maxcount = 0;
    var prodcount = 1;
    for (var concept_id in dims) {
        var concept = dims[concept_id];
        if (concept.array) {
            return concept.array.length;
        }
        else if (concept.count) {
            var c = concept.count;
            if (c > maxcount) maxcount = c;
            prodcount *= c;
        }
    }
    return prodcount;
}

function foreach_percept(idea,cb=null,into={}) {
    var dims = idea.axes;
    var index_max = idea_max_indices(idea);
    for (var index=0; index<index_max; index++) {
        for (var concept_id in dims) {
            var concept = dims[concept_id];
            var value = concept_value_by_index(concept, index );
            into[concept_id] = value;
        }
        if (cb) cb(into,index);
    }
}

function idea_subset(idea,subset,into={}) {
    into.concepts = idea.concepts;

}

function configure_opacity() {
    var size = idea_max_indices( LEWCID_OPACITY_BUFFER );
    LEWCID_OPACITY_BUFFER.axes.opacity.array = new Array( size );

    var data = LEWCID_CONSOLE_BUFFER;
    var font = LEWCID_FONT_BASIC;

    var data_values = {};
    var font_values = {};

    foreach_percept(LEWCID_OPACITY_BUFFER, (pixel) => {
        data_values.x = pixel.x / 8;

    });
}
configure_opacity();




function canvas_ideas_draw_percepts() {

}