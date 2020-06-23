
var LEWCID_KEYBOARD = {
    "concepts":{
        "char":{count:1},
        "col":{mod:42},
        "line":{pack:42,mod:5},
        "SHFT":{pack:(42*5)},
    },
    "percepts":"" +
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
"",
};

function keyboard_check(idea) {
    var data = idea.percepts;
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
    "concepts":{
        "char":{count:1},
        "x":{mod:12},  // index%12
        "y":{pack:12}, // (index/12)
    },
    "percepts":"Hello World.New Line."
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
        "all":(8*16*12*2),
        "x":{mod:(8*12)},
        "y":{pack:(8*12),mod:(16*2)},
        "opacity":{
            count:1,mod:1, min:0, max:1,
            value:(
                0//LEWCID_FONT(char=LEWCID_CONSOLE_BUFFER(X/8,Y/16).char)
            ),
        },
    },
    "process":{},
};

// dimension attributes:
//
//  var address = ( ( ( ( index + pre_offset ) / pack ) % mod ) + post_offset );
//  if (count)
//    return percepts[ address ... (address + count) ]
//  else
//    return address

function idea_concept_by_index(idea,concept,index) {
    var address = index;
    if (concept.pack) {
        var offset = address % concept.pack;
        address = ((address - offset) / concept.pack);
    }
    if (concept.mod)
        address %= concept.mod;
    if (concept.count) {
        return idea.percepts[ address ];
    } else {
        return address;
    }
}

function foreach_percept(idea,cb=null,into={}) {
    var index_max = idea.percepts.length;
    var dims = idea.concepts;
    for (var index=0; index<index_max; index++) {
        for (var concept_id in dims) {
            var concept = dims[concept_id];
            var value = idea_concept_by_index(idea, concept, index );
            into[concept_id] = value;
        }
        if (cb) cb(into,index);
    }
}

function idea_subset(idea,subset,into={}) {
    into.concepts = idea.concepts;

}

function canvas_ideas_draw_percepts() {

}