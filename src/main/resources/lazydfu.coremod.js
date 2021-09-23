// class imports
var ASMAPI = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var Opcodes = Java.type('org.objectweb.asm.Opcodes');

function initializeCoreMod() {
    return {
        'createFixerUpper': {
            'target': {
                'type': 'METHOD',
                'class': 'net.minecraft.util.datafix.DataFixers',
                'methodName': 'm_14529_',
                'methodDesc': '()Lcom/mojang/datafixers/DataFixer;'
            },
            'transformer': createFixerUpper
        }
    }
}

// Change all calls of "new DataFixerBuilder()" to "new LazyDataFixerBuilder()"
function createFixerUpper(method) {
    var i
    var newCount = 0
    var invokeCount = 0

    for (i = 0; i < method.instructions.size(); i++) {
        var insn = method.instructions.get(i)

        if (insn.getOpcode() == Opcodes.NEW && insn.desc.equals('com/mojang/datafixers/DataFixerBuilder')) {
            insn.desc = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            newCount++
        }

        if (insn.getOpcode() == Opcodes.INVOKESPECIAL && insn.owner.equals('com/mojang/datafixers/DataFixerBuilder') && insn.name.equals('<init>')) {
            insn.owner = 'me/steinborn/lazydfu/mod/LazyDataFixerBuilder'
            invokeCount++
        }
    }

    // finish up
    if (newCount == 1 && invokeCount == 1) {
        ASMAPI.log('INFO', '[LazyDFU] LazyDFU was initialized successfully.')
    } else if (newCount == 0 || invokeCount == 0) {
        ASMAPI.log('FATAL', '[LazyDFU] LazyDFU seems to have been initialized successfully, but something seems off.')
        ASMAPI.log('FATAL', '[LazyDFU] Any variable trying to create a normal DataFixerBuilder did not exist at the time of method transformation.')
        ASMAPI.log('FATAL', '[LazyDFU] This usually means another mod is trying to kill or modify the data fixer initialization system.')
        ASMAPI.log('FATAL', '[LazyDFU] Please avoid using mods alongside LazyDFU that do this such as DataBreaker, DataFixerSlayer, or RandomPatches\'s data fixer disabler.')
    } else {
        ASMAPI.log('FATAL', '[LazyDFU]  LazyDFU seems to have been initialized successfully, but something seems off.')
        ASMAPI.log('FATAL', '[LazyDFU] It seems like more than one DataFixerBuilder was transformed in the method, which should be impossible.')
        ASMAPI.log('FATAL', '[LazyDFU] In any case, please avoid using mods alongside LazyDFU that do this such as DataBreaker, DataFixerSlayer, or RandomPatches\'s data fixer disabler.')
    }

    return method;
}
