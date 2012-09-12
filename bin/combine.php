<?php
if(sizeof($argv) != 3) die("Wrong number of arguments");

$fname = $argv[1];
echo "fname:" . $fname;
$fnameout = $argv[2];
$fh = fopen($fname, "r");

$fhout = fopen($fnameout, "w");

while (($lin = fgets($fh)) !== FALSE) {    
    if(strpos($lin, "#") !== false) {
        $lin = substr($lin, 0,strpos($lin, "#"));
    }
    $lin = trim($lin);
    
    if(strlen($lin) > 0) {
        echo "[" . $lin . "]\n";
        fwrite($fhout, "// file: " . $lin . "\n");
        $ct = file_get_contents($lin);
        fwrite($fhout, $ct . "\n");
    }
}

fclose($fh);
fclose($fhout);
?>
