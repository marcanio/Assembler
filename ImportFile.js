var withComments;           
var codeSegmentStart;            
var withoutComments = new Array();
var branchDest = new Map();
var valueMapping = new Map();
var lineNumber =0;
var dataLocation = 0;
var arrayNames = new Array();
var dataValues = new Array();
var varibleNames = new Array();

var machineCode = "";

var instructionSet = ["NOOP","INPUTC","INPUTCF","INPUTD","INPUTDF",
"MOVE","LOADI","LOADP","ADD","ADDI","SUB","SUBI",
"LOAD","LOADF","STORE","STOREF",
"SHIFTL","SHIFTR","CMP","JUMP","BRE","BRNE","BRG","BRGE"];

var instructionFormat = ["0000_", // NOOP
"0001_", // INPUTC
"0001_", // INPUTCF
"0001_", // INPUTD
"0001_", // INPUTDF
"0010_", // MOVE
"0011_", // LOADI
"0011_", // LOADP

"0100_", // ADD
"0101_", // ADDI
"0110_", // SUB
"0111_", // SUBI

"1000_", // LOAD
"1001_", // LOADF
"1010_", // STORE
"1011_", // STOREF

"1100_", // SHIFTL
"1100_", // SHIFTR
"1101_", // CMP
"1110_", // JUMP
"1111_", // BRE_BRZ
"1111_", // BRNE_BRNZ
"1111_", // BRG
"1111_"  // BRGE
];


window.onload = function() {
		var fileInput = document.getElementById('fileInput');
		var fileDisplayArea = document.getElementById('fileDisplayArea');

		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
		
				var reader = new FileReader();
                //Pass each line to the remove comments function
				reader.onload = function(e) {
                    fileDisplayArea.innerText = reader.result;
                    let lines = this.result.split('\n');
                    removeComments(lines);
				}

                reader.readAsText(file);	
		});
}
/**
 * Finds all the data after .data and passes it to be proccessed
 */
function findDataStart(code){
    for(var i =0; i< code.length; i++){
        lineNumber++;
        var lineRead = code[i];
        if(lineRead.localeCompare(".data") == 0){
            parseDataSegment(code);
            break;
        }else{
            alert("Expecting (.data) ");
        }
    }
}
/**
 * Parse the code after data
 */
function parseDataSegment(code){
    for(var i=0; i < code.length; i++){
        lineNumber++;
        var asmLine = code[i];
        if(asmLine.localeCompare(".code") == 0){
            break;
        }else if(asmLine.localeCompare(".data") == 0){
            continue;
        }
        assignDataVariable(code[i]);

    }
}
/**
 * Setting up the varibles that are contained in data
 * 
 */
function assignDataVariable(code){
    var lineParts = code.split(" ");    //Break up the instrcution and get rid of white space
    lineParts = removeEmpty(lineParts);
    var varibleName = lineParts[0];
    valueMapping.set(varibleName,dataLocation);
    var BYTE = lineParts[1];
    if(BYTE.localeCompare("BYTE") == 1){
        alert("Expected data type BYTE");
    }
    for(var i =2; i < lineParts.length; i++){
        var innerString = lineParts[i];
        if(innerString.localeCompare(",") == 0){
            arrayNames.push(varibleName);
            continue;
        }
        else if(innerString.localeCompare("?") == 0){
            dataLocation++;
            dataValues.push(0);
            varibleNames.push(varibleName);
        }else{
            if(!isNaN(innerString)){
                dataLocation++;
                dataValues.push(innerString);
                varibleNames.push(varibleName);
            }else{
                alert("Expecting numberical value, instead recieved " + innerString);
            }
        }
    }
    if(varibleNames.length >16 ){
        alert("YOU HAVE MORE THAN 16 BYTES IN YOUR DATA SEGMENT!");
    }

}
/**
 * Looks at the code segment and uses getOpCodeBits to get machine code and 
 * call a given funciton to complete the instruction
 */
function parseCodeSegment(code){
    codeSegmentStart = lineNumber -1;
    
    for(var i =codeSegmentStart; i < code.length; i++){
        lineNumber ++;
        var lineScanner = code[i].split(" ");
        lineScanner = removeEmpty(lineScanner);

        var opcode = lineScanner[0];
        if(opcode.localeCompare("NOOP") == 0){
            getOpCodeBits("NOOP");
            parseNOOP();
        }
        else if(opcode.localeCompare("LOADI") == 0){
            getOpCodeBits("LOADI");
            parseLOADI(lineScanner);
        }
        else if(opcode.localeCompare("LOADP") == 0){
            getOpCodeBits("LOADP");
            //parseLOADP(lineScanner);
        }
        else if(opcode.localeCompare("CMP")== 0){
            getOpCodeBits("CMP");
            //parseCMP(lineScanner);
        }
        else if(opcode.localeCompare("LOAD") ==0){
            getOpCodeBits("LOAD");
            parseLOAD(lineScanner);
        }
        else if(opcode.localeCompare("STORE")== 0){
            getOpCodeBits("STORE");
            //parseSTORE(lineScanner);
        }
        else if(opcode.localeCompare("STOREF") == 0){
            getOpCodeBits("STOREF");
            //parseSTOREF(lineScanner);
        }
        else if(opcode.localeCompare("LOADF") == 0){
            getOpCodeBits("LOADF");
            //parseLOADF(lineScanner);
        }
        else if(opcode.localeCompare("INPUT") == 0){
            getOpCodeBits("INPUT");
            //parseINPUT(lineScanner);
        }
        else if(opcode.localeCompare("BRE") == 0 || opcode.localeCompare("BRZ")){
            getOpCodeBits("BRE");
            //parseBRE(lineScanner, lineNumber - codeSegmentStart);
        }
        else if(opcode.localeCompare("BRNE") || opcode.localeCompare("BRNZ")){
            getOpCodeBits("BRNE");
            //parseBRNE(lineScanner, lineNumber - codeSegmentStart);
        }
        else if(opcode.localeCompare("BRG") == 0){
            getOpCodeBits("BRG");
            //parseBRG(lineScanner,lineNumber - codeSegmentStart);
        }
        else if(opcode.localeCompare("BRGE") == 0){
            getOpCodeBits("BRGE");
            //parseBRGE(lineScanner,lineNumber - codeSegmentStart);
        }
        else if(opcode.localeCompare("JUMP") ==0){
            getOpCodeBits("JUMP");
            //parseJUMP(lineScanner,lineNumber - codeSegmentStart);
        }
        else if(opcode.localeCompare("ADD") == 0){
            getOpCodeBits("ADD");
            //parseADD(lineScanner);
        }
        else if(opcode.localeCompare("ADDI") == 0){
            getOpCodeBits("ADDI");
            //parseADDI(lineScanner);
        }
        else if(opcode.localeCompare("SUB") == 0){
            getOpCodeBits("SUB");
            //parseSUB(lineScanner);
        }
        else if(opcode.localeCompare("SUBI") == 0){
            getOpCodeBits("SUBI");
            //parseSUBI(lineScanner);
        }
        else if(opcode.localeCompare("MOVE") == 0){
            getOpCodeBits("MOVE");
            //parseMOVE(lineScanner);
        }
        else if(opcode.localeCompare("INPUTC") == 0){
            getOpCodeBits("INPUTC");
            //parseINPUTC(lineScanner);
        }
        else if(opcode.localeCompare("INPUTCF") ==0){
            getOpCodeBits("INPUTCF");
            //parseINPUTCF(lineScanner);
        }
        else if(opcode.localeCompare("INPUTD") ==0){
            getOpCodeBits("INPUTD");
            //parseINPUTD(lineScanner);
        }
        else if(opcode.localeCompare("INPUTDF") == 0){
            getOpCodeBits("INPUTDF");
            //parseINPUTDF(lineScanner);
        }
        else if(opcode.localeCompare("SHIFTL") ==0){
            getOpCodeBits("SHIFTL");
            //parseSHIFTL(lineScanner);
        }
        else if(opcode.localeCompare("SHIFTR") == 0){
            getOpCodeBits("SHIFTR");
            //parseSHIFTR(lineScanner);
        }
        else{
            errorMessage("Invalid opcode: " + opcode + " ");
        }
    }


}
/**
 * Adds the opcode bits to the corresponding instruction to the final output of macheine code
 */
function getOpCodeBits(instruction){
    for(var i=0; i< instructionSet.length; i++){
        if(instruction.localeCompare(instructionSet[i]) ==0){
            machineCode += instructionFormat[i];
            return;
        }
    }
    errorMessage("Expecting Opcode");
}

/**
 * Takes in the error as input and outputs to the user what line the error is occuring on 
 */
function errorMessage(error){
    alert(error + " on line " + lineNumber);
}
/*
 * All lines after .code should start with a jump label (EX:) or opcode.
 * This method creates jump labels while simultaneously checking for incorrect tokens.
 * 
 */
function getJumps(withoutComments){
    var lineCount =0;
    var codeRead = false;
    var toReturn = new Array();
    var count =0;
    for(var i=0; i< withoutComments.length; i++){
        var line = withoutComments[i];
        if(line.includes(".code")){
            lineCount =-1;
            codeRead = true;
            toReturn[count] =".code";
            
        }
        else if(line.includes(":")){
            //Water is warm
            branchDest.set(line.substring(0,line.indexOf(":")),lineCount);
            toReturn[count] = line.substring(line.indexOf(":")+1, line.length);
            
        }
        else{
            if(codeRead){
                var findOpCode = line.split(" ");
                findOpCode = removeEmpty(findOpCode); //To remove blank spots in array
                var validOpCode = false;
                var validString = false;
                var firstToken = "";
                for(var j=0; j<findOpCode.length; j++){
                    firstToken = findOpCode[j];
                    validString = true;
                    for(var k = 0; k < instructionSet.length; k++){
                        if(firstToken.localeCompare(instructionSet[k]) == 0){
                            validOpCode = true;
                            break;
                        }
                    }
                }
                if(!validOpCode && validString){
                    window.alert("Did you forget a colon(:) after your label? Incorrect token \""+ firstToken + "\" \n at line \"" + line + "\"");
                    exit();
                }
            }
            toReturn[i] = line;
        }
        count ++;
        lineCount++;
        
    }
    return toReturn;
}
function removeEmpty(instruction){
    var count =0;
    var newInstruction = new Array();

    for(var i=0; i < instruction.length;i++){
        if(instruction[i] != ""){
            newInstruction[count] = instruction[i];
            count++;
        }
    }
    return newInstruction;
}
/**
 * Logic to remove comments in the array with all the code 
 * @param {} lines 
 */
function removeComments(lines){
    
    for(var line =0; line< lines.length; line++){
        
        lines[line] = lines[line].replace(new RegExp(",",'g') , " , ");
		lines[line] = lines[line].replace("]" , " ] ");
		lines[line] = lines[line].replace("[" , " [ ");
		lines[line] = lines[line].replace("}" , " } ");
		lines[line] = lines[line].replace("{" , " { ");
		lines[line] = lines[line].replace("+" , " + ");
        lines[line] = lines[line].replace("-" , " - ");
        var curString = lines[line];
        if (curString.startsWith(";")){
            lines[line] = "";
        }else if(curString.includes(";")){
            lines[line] = lines[line].substring(0,lines[line].indexOf(";"));
        }
        //console.log(lines[line]);
    }
    withComments =lines;
}
/**
 * Place the code inside "withoutComments" That no longer has comments for the file
 */
function formatFile(){
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    fileDisplayArea.innerText = "";
    var count = 0;
    //Remove white spaces
    for(var i=0; i < withComments.length;i++){
        if(withComments[i] != ""){
            withoutComments[count] = withComments[i];
            count++;
        }
    }
    //console.log(withoutComments);
    

    withoutComments = getJumps(withoutComments);
    findDataStart(withoutComments);
    parseCodeSegment(withoutComments);
    console.log(withoutComments);
    console.log(lineNumber);
    console.log(machineCode);
    for(var line =0; line <withoutComments.length; line++){
        fileDisplayArea.innerText += withoutComments[line] + "\n";
    }

}
function formatInput(){
    let inputP = document.getElementById("textInput");
    let lines =  inputP.innerText.split("\n");
    var count =0;
    removeComments(lines);
    inputP.innerText ="";
    //remove white spaces
    for(var i=0; i < withComments.length;i++){
        if(withComments[i] != ""){
            withoutComments[count] = withComments[i];
            count++;
        }
    }
    for(var line =0; line < withoutComments.length; line++){
        inputP.innerText += withoutComments[line] + "\n";
    }

}
//------------------------------BELOW is all of the parses for each instrcution---------------

/**
 * NOOP instruction in machine code
 */
function parseNOOP(){
    machineCode += "00_00_00000000";
	machineCode += "\n";
}
/**
 * LOADI instruction and machine code
 */
function parseLOADI(code){
    var reg = code[1];
    machineCode += getRegisterName(reg);
    getComma(code[2]);
    machineCode += "00_";
    machineCode += convertStringToBinary(code[3]);
    machineCode += "\n";
}

/**
 * LOAD instruction to machine code
 */
function parseLOAD(code){
    machineCode += getRegisterName(code[1]);
    machineCode += "00_";
    getComma(code[2]);
    getLeftBracket(code[3]);
    var dataValue = code[4];
    var next = code[5];

    if(next.localeCompare("+") == 0){
        var offset = parseInt(code[6]);
        var newOffset = valueMapping.get(dataValue) + offset;
        checkAddressOutOfBounds(newOffset);
        machineCode += convertStringToBinary(newOffset);
        getRightBracket(code[7]);
    }
    else if(next.localeCompare("-") == 0){
        var offset = parseInt(code[6]);
        var newOffset = valueMapping.get(dataValue) - offset;
        checkAddressOutOfBounds(newOffset);
        machineCode += convertStringToBinary(newOffset);
        getRightBracket(code[7]);
    }
    else if(next.localeCompare("]") ==0){
        machineCode += convertStringToBinary(valueMapping.get(dataValue));
    }
    else{
        errorMessage("Expecting +, - or ]");
    }
    machineCode += "\n";


}
/**
 * Maps a string to binary by looping through value
 */
function mapIntoBinary(string){
    var toReturn = string;
    for(var i =0; i < string.length; i++){
        toReturn = 0 + toReturn;
    }
    return toReturn;
}
/**
 * converts a string to binary used for immediate values
 */
function convertStringToBinary(input){
    if(isNaN(input)){
        errorMessage("Expecting immediate value (Integer) ");
    }else{
        var eightBit = mapIntoBinary(input.toString(2));
        if(eightBit.length > 8){  //Case of negative
            return eightBit.substring(eightBit.length-8, eightBit.length);
        }
        return eightBit;
    }

}

/**
 * Function makes sure the address is within the given 0 -64
 */
function checkAddressOutOfBounds(address){
    if(address < 0 || address >63){
        error("Adress out of bounds, attempting to access address " + address);
    }
}
/**
 * Checking for comma
 */
function getComma(comma){
    if(comma.localeCompare(",") == 1){
        errorMessage("Expecting comma");
    }
}
/**
 * Checking for a left bracket
 */
function getLeftBracket(leftBracket){
    if(leftBracket.localeCompare("[") == 1){
        errorMessage("Expected left bracket");
    }
}
/**
 * Checking for a Right bracket
 */
function getRightBracket(rightBracket){
    if(leftBracket.localeCompare("]") == 1){
        errorMessage("Expected left bracket");
    }
}
/**
 * Get the machine code for each register
 * Allowed registers A, B, C, D 
 */
function getRegisterName(register){
    if(register.localeCompare("A") == 0){
        return "00_";
    }
    else if(register.localeCompare("B") == 0){
        return "01_";
    }
    else if(register.localeCompare("C") == 0){
        return "10_";
    }
    else if(register.localeCompare("D") == 0){
        return "11_";
    }
    else{
        errorMessage("Expecting register name (A,B,C,D)");
        return "0";
    }
}

/**
 * Choice to show the file open options
 */
function ShowFile(){
    let T = document.getElementById("fileDiv");
    let F = document.getElementById("inputDiv");
    T.style.display ="block";
    F.style.display ="none";
}
/**
 * Choice to show the input box
 */
function ShowTextbox(){
    let F = document.getElementById("inputDiv");
    let T = document.getElementById("fileDiv");
    F.style.display ="block";
    T.style.display = "none";
}
/**
 * Used by the input box to see a preview of what you will compile
 */
function fillP(){
    let input = document.getElementById("textArea");
    let paragraph = document.getElementById("textInput");
    paragraph.innerText = input.value;

}
//TODO - Parse only the data
function getData(){ 
}
