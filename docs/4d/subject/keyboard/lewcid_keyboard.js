
var LEWCID_KEYBOARD = {
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

var LEWCID_FONT = LEWCID_FONT_BASIC;
/*
    "concepts":{
        "opacity":{count:1,min:0,max:1},
        "x":{mod:8},
        "y":{pack:8,mod:16},
        "char":{pack:(8*16)},
    },
*/

var LEWCID_KEYBOARD_IMAGE = {

};

var LEWCID_CONSOLE_BUFFER = {
    "axes":{
        "x":{mod:12},  // index%12
        "y":{pack:12}, // (index/12)
        "char":{array:"Hello World.New Line."}
    },
};

/*
LEWCID_FONT( char=LEWCID_CONSOLE_BUFFER ) == {
    "concepts":{
        "all":{count:786432},
        "opacity":{count:1,mod:1,min:0,max:1},
        "x":{pack:1,mod:96},
        "y":{pack:1536,mod:512},
    },
    "percepts":{

    },
};

perceptions( LEWCID_KEYBOARD )

concept_reduce( LEWCID_KEYBOARD, LEWCID_FONT );

*/


var LEWCID_OPACITY_BUFFER = {
    "concepts":{
        "x":{mod:(8*12)},
        "y":{pack:(8*12),mod:(16*2)},
        "opacity":{
            count:(8*16*12*2),
            mod:1, 
            min:0, max:1,
            value:(
                0 //LEWCID_FONT(char=LEWCID_CONSOLE_BUFFER(X/8,Y/16).char)
            ),
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

function idea_index_by_value(idea,values) {
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
    var count = 1;
    for (var concept_id in dims) {
        var concept = dims[concept_id];
        if (concept.array) {
            return concept.array.length;
        }
    }
    return count;
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

        // if testing:
        var testIndex = idea_index_by_value(idea, into);
        if (testIndex != index) {
            console.log("[" + index + "]");
        }
    }
}

function idea_subset(idea,subset,into={}) {
    into.concepts = idea.concepts;

}

function canvas_ideas_draw_percepts() {

}