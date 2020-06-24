
// Lewid (LCD) Kernel

var lewcidKernel = {
    ThreadStruct : [
        "offset_register_ptr",
        "offset_instruction_ptr",
        "offset_stack_ptr",
        "offset_heap_ptr",
        "__t0",
        "__t1",
        "__t2",
        "__t3",
    ],
    StackCodes : [
        {id:"nop"},
        {id:"kernel_init"},
        {id:"kernel_main"},
        {id:"kernel_return"},
        {id:"push_i"}, // #
        {id:"push"}, // src
        {id:"pop"}, // dst
        {id:"peek"}, // dst
        {id:"var"}, // id, initial
    ],
    Test:{
        StackSource : [
            "var row",
            "var col",
            "push_i 0",
            "push_i 1",
            "pop row",
            "peek col",
            "push row",
            "push col",
        ],
    },
    MicroRegisters : [
        "r_zero",
        "r_micro_thread_ptr",
        "r_micro_ins_ptr",
        "r_micro_link_ptr",
        "r_thread",
        "r_ins_ptr",
        "r_stack_ptr",
        "r_reg_ptr",
        "r_op_code",
        "r_temp_0",
        "r_temp_regid"
    ],
    MicroOps : [
        "nop", // no operation { }
        "kernel_flush",
        "label", // label
        "thread_ptr_read", // dst = r_thread_ptr
        "read", // dst = [ src + offset ]
        "write", // [ src + offset ] = dst
        "add", // dst = [ src + # ]
        "adde", // dst += #
        "jump", // ins_ptr = dst
        "jump_if", // if (src == #) ins_ptr = dst
        "jump_op", // ins_ptr = @dst
    ],
    MicroStruct : [
        "opcode",
        "dst",
        "src",
        "cnst"
    ],
    MicroSource : [
        "@ kernel_init",

        // read current instruction:
        "thread_ptr_read r_thread",
        "read r_ins_ptr, r_thread, offset_instruction_ptr",
        "read r_stack_ptr, r_thread, offset_stack_ptr",
        "read r_reg_ptr, r_thread, offset_register_ptr",

        // read instruction and jump to it:
        "@ kernel_main",
        "read r_op_code, r_ins_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "jump_op r_op_code", // goto label below

        // return statement:
        "@ kernel_return",
        "write r_ins_ptr, r_thread, offset_instruction_ptr",
        "write r_stack_ptr, r_thread, offset_stack_ptr",
        "kernel_flush",
        "jump @kernel_main",

        // push immediate
        "@ push_i",
        "read r_temp_0, r_ins_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "write r_temp_0, r_stack_ptr, 0", // write
        "add r_stack_ptr, r_stack_ptr, 1",
        "jump @kernel_return",

        // pop register
        "@ pop",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_stack_ptr, 0", // read
        "write r_temp_0, r_temp_regid", // write
        "add r_stack_ptr, r_stack_ptr, -1",
        "jump @kernel_return",

        // push register
        "@ push",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_temp_regid", // read
        "write r_temp_0, r_stack_ptr, 0", // write
        "add r_stack_ptr, r_stack_ptr, 1",
        "jump @kernel_return",

        // peek register
        "@ peek",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_stack_ptr, 0", // read
        "write r_temp_0, r_temp_regid", // write
        //"add r_stack_ptr, r_stack_ptr, 1", // dont move stack
        "jump @kernel_return",

        // return
    ],
    MicroAssembly : null,
    MicroSymbols : null,
    MicroLinkTable : null,
};

var lewcidMemory = {
    DefaultMemory : {
        MainMemory : [],
        MainSymbols : [],
        KernelAssemblyPtr : 0,
        KernelAssemblyLinkPtr : 0,
        LatestSymbol : null,

        Read : function(index) {
            if ((index < 0) || (index >= this.MainMemory.length))
                throw "Write out of bounds";

            this.LatestSymbol = this.MainSymbols[index];
            console.assert(this.LatestSymbol != null);

            return this.MainMemory[index];
        },
        Write : function(index,value) {
            if ((index < 0) || (index >= this.MainMemory.length))
                throw "Write out of bounds";

            this.LatestSymbol = this.MainSymbols[index];
            console.assert(this.LatestSymbol != null);

            this.MainMemory[index] = value;
        },

        ProcAlloc : function(thread_ptr=0) {
            var kernel = lewcidKernel;
            var size = kernel.MicroRegisters.length;
            var proc_ptr = this.AllocSize(size, kernel.MicroRegisters );
            this.ProcWriteMicroRegByName( proc_ptr, "r_micro_ins_ptr", this.KernelAssemblyPtr );
            this.ProcWriteMicroRegByName( proc_ptr, "r_micro_link_ptr", this.KernelAssemblyLinkPtr );
            this.ProcSetThread(proc_ptr, thread_ptr);
            return proc_ptr;
        },

        ProcMicroStep : function(proc) {
            var micro_ins_ptr = this.ProcReadMicroRegByName(proc, "r_micro_ins_ptr");
            this.ProcWriteMicroRegByName(proc, "r_micro_ins_ptr", micro_ins_ptr + 4);

            var mop = this.Read(micro_ins_ptr+0);
            var dst = this.Read(micro_ins_ptr+1);
            var src = this.Read(micro_ins_ptr+2);
            var cst = this.Read(micro_ins_ptr+3);

            var mopName = lewcidKernel.MicroOps[ mop ];
            switch (mopName) {
                case "read":
                    {
                        var addr = this.ProcReadMicroRegByIndex( proc, src );
                        addr += cst;
                        var val = this.Read( addr );
                        this.ProcWriteMicroRegByIndex( proc, dst, val );
                    }
                    break;
                case "write":
                    {
                        var addr = this.ProcReadMicroRegByIndex( proc, src );
                        addr += cst;
                        var val = this.ProcReadMicroRegByIndex( proc, dst );
                        this.Write( addr, val );
                    }
                    break;
                case "add":
                    {
                        var val = this.ProcReadMicroRegByIndex( proc, src );
                        val += cst;
                        this.ProcWriteMicroRegByIndex( proc, dst, val );
                    }
                    break;
                case "jump_op":
                    {
                        var op = this.ProcReadMicroRegByIndex( proc, dst );
                        var link_table = this.ProcReadMicroRegByName(proc, "r_micro_link_ptr");
                        var link_ptr = this.Read( link_table + op );
                        this.ProcWriteMicroRegByName(proc, "r_micro_ins_ptr", link_ptr );

                        //var REMOVE_ME = this.Read( link_ptr );
                    }
                    break;
                case "thread_ptr_read":
                    {
                        var val = this.ProcReadMicroRegByName(proc, "r_micro_thread_ptr");
                        this.ProcWriteMicroRegByIndex( proc, dst, val );
                    }
                    break;
                case "kernel_flush":
                    return false;
                    break;
                default:
                    throw "Unknown op [" + mopName + "]";
                    break;
            }
            return true;
        },

        ProcMicroRegByName : function(proc, regName) {
            var index = lewcidCompiler.indexIn( regName, lewcidKernel.MicroRegisters );
            return proc + index;
        },
        ProcReadMicroRegByName : function(proc, regName) {
            return this.Read( this.ProcMicroRegByName( proc, regName ) );
        },
        ProcWriteMicroRegByName : function(proc, regName, value) {
            this.Write( this.ProcMicroRegByName(proc, regName), value);
        },
        ProcReadMicroRegByIndex : function(proc, index, value) {
            return this.Read( proc + index );
        },
        ProcWriteMicroRegByIndex : function(proc, index, value) {
            this.Write( proc + index, value );
        },
        ThreadRegByName : function(thread_ptr, regName) {
            var index = lewcidCompiler.indexIn( regName, lewcidKernel.ThreadStruct );
            return thread_ptr + index;
        },

        AllocSize : function(sz,symbols) {
            var start = this.MainMemory.length;
            this.CheckSymbols();
            for (var i=0; i<sz; i++) {
                this.MainMemory.push(0);
                this.MainSymbols.push(symbols[i % symbols.length]);
            }
            this.CheckSymbols();
            return start;
        },
        AllocBuffer : function(buffer, symbols) {
            var start = this.MainMemory.length;
            this.CheckSymbols();
            for (var i=0; i<buffer.length; i++) {
                this.MainMemory.push( buffer[i] );
                this.MainSymbols.push( symbols[i % symbols.length] )
            }
            this.CheckSymbols();
            return start;
        },

        MethodAlloc : function(assembly,symbols) {
            return this.AllocBuffer(assembly,symbols);
        },
        CheckSymbols : function() {
            console.assert( this.MainMemory.length == this.MainSymbols.length );
        },

        ThreadAlloc : function(startMethod) {
            var size = lewcidKernel.ThreadStruct.length;
            
            var thread_ptr = this.AllocSize( size, lewcidKernel.ThreadStruct );
            var stack_ptr = this.AllocSize( 12, [ "stack_data" ] );
            this.CheckSymbols();

            this.Write( this.ThreadRegByName(thread_ptr, "offset_instruction_ptr"), startMethod );
            this.Write( this.ThreadRegByName(thread_ptr, "offset_register_ptr"), this.ThreadRegByName(thread_ptr, "__t0") );
            this.Write( this.ThreadRegByName(thread_ptr, "offset_stack_ptr"), stack_ptr );
            this.CheckSymbols();

            return thread_ptr;
        },


        ProcSetThread : function(proc_ptr, thread_ptr) {
            this.ProcWriteMicroRegByName( proc_ptr, "r_micro_thread_ptr", thread_ptr );
        },

    },
    AllocateMemory : function() {
        var kernel = lewcidKernel;
        var proc = Object.create( this.DefaultMemory );
        proc.MainMemory = []; // new array
        proc.MainSymbols = [];

        var pre_ptr = proc.AllocSize( 4, [ "bad_addr" ] );
        proc.KernelAssemblyPtr = proc.AllocBuffer( kernel.MicroAssembly, kernel.MicroSymbols );
        proc.KernelAssemblyLinkPtr = proc.AllocBuffer( kernel.MicroLinkTable, kernel.StackCodes );
        
        return proc;
    },
};

var lewcidCompiler = {
    indexIn : function (name,array) {
        for (var i in array) {
            var k = array[i];
            if (k == name)
                return 1*i;
        }
        throw "Unknown item '" + name + "'";
    },
    tokenize : function (str) {
        var parts = str.split(" ");
        var result = [];
        for (var pi in parts) {
            var p = parts[pi].replace(",","").trim();
            if (p != "")
                result.push(p);
        }
        return result;
    },
    stackcode_by_name : function (name) {
        var kernel = lewcidKernel;
        for (var i in kernel.StackCodes) {
            var code = kernel.StackCodes[i];
            code.index = i; // TODO: pre-store this
            if (code.id == name)
                return code;
        }
        throw "unknown stack code '" + name + "'";
    }
};

function lewcidKernel_EnsureCompiled_Kernel() {
    var kernel = lewcidKernel;
    if (kernel.MicroAssembly)
        return kernel;
    kernel.MicroAssembly = [];
    kernel.MicroSymbols = [];
    var stackcode_by_name = lewcidCompiler.stackcode_by_name;
    var indexIn = lewcidCompiler.indexIn;
    var tokenize = lewcidCompiler.tokenize;
    for (var lineIndex in kernel.MicroSource) {
        var line = kernel.MicroSource[lineIndex];
        var parts = tokenize(line);
        if (parts[0] == "@") {
            var code = stackcode_by_name(parts[1]);
            code.offset = kernel.MicroAssembly.length + kernel.MicroStruct.length;
            continue;
        }
        var r_op_code = indexIn( parts[0], kernel.MicroOps );
        var r_op_dst = 0;
        if (parts.length >= 2) {
            if (parts[1].startsWith("@")) {
                r_op_dst = stackcode_by_name(parts[1].substr(1)).offset;
                console.assert( r_op_dst );
            } else {
                r_op_dst = indexIn( parts[1], kernel.MicroRegisters );
                console.assert( r_op_dst );
            }
        }
        var r_op_src = 0;
        if (parts.length >= 3)
            r_op_src = indexIn( parts[2], kernel.MicroRegisters );
        var r_op_const = 0;
        if (parts.length >= 4) {
            if (!isNaN(parts[3])) {
                r_op_const = 1*parts[3];
            } else {
                r_op_const = indexIn( parts[3], kernel.ThreadStruct );
            }
        }

        var startAddr = kernel.MicroAssembly.length;
        kernel.MicroAssembly.push( 1*r_op_code );
        kernel.MicroAssembly.push( 1*r_op_dst );
        kernel.MicroAssembly.push( 1*r_op_src );
        kernel.MicroAssembly.push( 1*r_op_const );
        console.assert( ( kernel.MicroAssembly.length - startAddr ) == kernel.MicroStruct.length );

        for (var ii=0; ii<4; ii++) {
            kernel.MicroSymbols.push( "@" + lineIndex + "," + ii + ": " + line );
        }

        console.assert( kernel.MicroAssembly.length == kernel.MicroSymbols.length );
    }

    kernel.MicroLinkTable = [];
    for (var li in kernel.StackCodes) {
        var code = kernel.StackCodes[li];
        kernel.MicroLinkTable[code.index] = code.offset;
    }

    return kernel;
}

function lewcidKernel_Compile_StackSource(source) {
    var kernel = lewcidKernel;
    var indexIn = lewcidCompiler.indexIn;
    var tokenize = lewcidCompiler.tokenize;
    var stackcode_by_name = lewcidCompiler.stackcode_by_name;
    var result = {
        assembly:[],
        symbols:[],
        source:(source),
        register_count:0,
        vars:["v0"],
    };
    var hasAllocatedVars = false;
    for (var lineIndex in source) {
        var line = source[lineIndex];
        var parts = tokenize(line);
        if (parts[0] == "var") {
            result.vars.push( parts[1] );
            continue;
        }
        if (!hasAllocatedVars) {
            hasAllocatedVars = true;
            var numVars = result.vars.length;
            result.register_count = numVars;
        }
        var stack_op = stackcode_by_name( parts[0] );
        result.assembly.push( 1 * stack_op.index );
        result.symbols.push(line);
        if (parts.length >= 1) {
            var val = parts[1];
            if (isNaN(val)) {
                var regIndex = indexIn( val, result.vars );
                val = regIndex;
            } else {
                val = 1 * val;
            }
            result.assembly.push( 1 * val );
            result.symbols.push(parts[1]);
        }
    }
    return result;
}

function lewcidKernel_EnsureCompiled() {
    var kernel = lewcidKernel_EnsureCompiled_Kernel();
    var method = lewcidKernel_Compile_StackSource(lewcidKernel.Test.StackSource);
    console.log(JSON.stringify(kernel));
    console.log(JSON.stringify(method));

    // Test out the method:
    var memory = lewcidMemory.AllocateMemory();
    var method_ptr = memory.MethodAlloc( method.assembly, method.symbols );
    var thread_ptr = memory.ThreadAlloc( method_ptr );
    var proc_ptr = memory.ProcAlloc( thread_ptr );
    var maxSteps = 10;
    while ( (maxSteps > 0) && memory.ProcMicroStep( proc_ptr ) ) {
        maxSteps--;
    }
}

lewcidKernel_EnsureCompiled();




