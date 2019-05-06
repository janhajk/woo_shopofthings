// User Config File
var config = require(__dirname + '/../config.js');
var utils = require(__dirname + '/../utils.js');

var archiver = require('archiver');
const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient(config.bitly.token);


var shorturl = function(url, cb) {
    bitly
        .shorten(url)
        .then(function(result) {
            console.log(result);
            cb(null, result);
        })
        .catch(function(error) {
            console.error(error);
            cb(error);
        });
};



var send = function(sku, link, res, cb) {
    link = Buffer.from(link, 'base64').toString('ascii');
    const schemaUrl = 'http://schemas.brother.info/ptouch/2007/lbx/';
    const logo = 'Object0.bmp';

    shorturl(link, function(error, bitlyLink) {
        var xml = '';
        xml += '<?xml version="1.0" encoding="UTF-8"?><pt:document xmlns:pt="' + schemaUrl + 'main" xmlns:style="' + schemaUrl + 'style" xmlns:text="' + schemaUrl + 'text"';
        xml += '      xmlns:draw="' + schemaUrl + 'draw" xmlns:image="' + schemaUrl + 'image" xmlns:barcode="' + schemaUrl + 'barcode" xmlns:database="' + schemaUrl + 'database" xmlns:table="' + schemaUrl + 'table"';
        xml += '      xmlns:cable="' + schemaUrl + 'cable" version="1.5" generator="P-touch Editor 5.2.014 Windows">';
        xml += '<pt:body currentSheet="Sheet 1" direction="LTR">';
        xml += '  <style:sheet name="Sheet 1">';
        xml += '  <style:paper media="0" width="107.8pt" height="91pt" marginLeft="4.3pt" marginTop="8.4pt" marginRight="4.4pt" marginBottom="8.5pt" orientation="portrait" autoLength="false" monochromeDisplay="true" printColorDisplay="false" printColorsID="0" paperColor="#FFFFFF" paperInk="#000000" split="1" format="264" backgroundTheme="0" printerID="14388" printerName="Brother QL-800"/>';
        xml += '  <style:cutLine regularCut="0pt" freeCut=""/>';
        xml += '  <style:backGround x="4.3pt" y="8.4pt" width="99.2pt" height="74.2pt" brushStyle="NULL" brushId="0" userPattern="NONE" userPatternId="0" color="#000000" printColorNumber="1" backColor="#FFFFFF" backPrintColorNumber="0"/>';
        xml += '<pt:objects>';

        // Image: Logo
        xml += '<image:image>';
        xml += '  <pt:objectStyle x="10.3pt" y="4.4pt" width="88pt" height="20.6pt" backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN" angle="0" anchor="TOPLEFT" flip="NONE">';
        xml += '    <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#000000" printColorNumber="1"/>';
        xml += '    <pt:brush style="NULL" color="#000000" printColorNumber="1" id="0"/>';
        xml += '    <pt:expanded objectName="Image5" ID="0" lock="2" templateMergeTarget="LABELLIST" templateMergeType="NONE" templateMergeID="0" linkStatus="NONE" linkID="0"/>';
        xml += '  </pt:objectStyle>';
        xml += '  <image:imageStyle originalName="logo_1000.png" alignInText="LEFT" firstMerge="true" fileName="' + logo + '">';
        xml += '    <image:transparent flag="false" color="#FFFFFF"/>';
        xml += '    <image:trimming flag="false" shape="RECTANGLE" trimOrgX="0pt" trimOrgY="0pt" trimOrgWidth="47.5pt" trimOrgHeight="11.2pt"/>';
        xml += '    <image:orgPos x="10.3pt" y="4.4pt" width="88pt" height="20.6pt"/>';
        xml += '    <image:effect effect="NONE" brightness="50" contrast="50" photoIndex="4"/>';
        xml += '    <image:mono operationKind="BINARY" reverse="0" ditherKind="MESH" threshold="128" gamma="100" ditherEdge="0" rgbconvProportionRed="30" rgbconvProportionGreen="59" rgbconvProportionBlue="11" rgbconvProportionReversed="0"/>';
        xml += '  </image:imageStyle>';
        xml += '</image:image>';

        // Text: Product Page
        xml += '<text:text>';
        xml += '  <pt:objectStyle x="4.3pt" y="70.4pt" width="99.1pt" height="12.1pt" backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN" angle="0" anchor="TOPLEFT" flip="NONE">';
        xml += '    <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#000000" printColorNumber="1"/>';
        xml += '    <pt:brush style="NULL" color="#000000" printColorNumber="1" id="0"/>';
        xml += '    <pt:expanded objectName="Text3" ID="0" lock="0" templateMergeTarget="LABELLIST" templateMergeType="NONE" templateMergeID="0" linkStatus="NONE" linkID="0"/>';
        xml += '  </pt:objectStyle>';
        xml += '  <text:ptFontInfo>';
        xml += '    <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
        xml += '    <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="10.5pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
        xml += '  </text:ptFontInfo>';
        xml += '  <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="true" avoidImage="false"/>';
        xml += '  <text:textAlign horizontalAlignment="CENTER" verticalAlignment="CENTER" inLineAlignment="CENTER"/>';
        xml += '  <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="24pt" combinedChars="false"/>';
        xml += '  <pt:data>Product Page</pt:data>';
        xml += '  <text:stringItem charLen="12">';
        xml += '    <text:ptFontInfo>';
        xml += '      <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
        xml += '      <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="10.5pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
        xml += '    </text:ptFontInfo>';
        xml += '  </text:stringItem>';
        xml += '</text:text>';
        
        // Barcode
        xml += '<barcode:barcode>';
        xml += '  <pt:objectStyle x="32.3pt" y="26.4pt" width="41.8pt" height="41.8pt" backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN" angle="0" anchor="TOPLEFT" flip="NONE">';
        xml += '    <pt:pen style="INSIDEFRAME" widthX="0.5pt" widthY="0.5pt" color="#000000" printColorNumber="1"/>';
        xml += '    <pt:brush style="NULL" color="#000000" printColorNumber="1" id="0"/>';
        xml += '    <pt:expanded objectName="Bar Code8" ID="0" lock="0" templateMergeTarget="LABELLIST" templateMergeType="NONE" templateMergeID="0" linkStatus="NONE" linkID="0"/>';
        xml += '  </pt:objectStyle>';
        xml += '  <barcode:barcodeStyle protocol="QRCODE" lengths="48" zeroFill="false" barWidth="1.2pt" barRatio="1:3" humanReadable="true" humanReadableAlignment="LEFT" checkDigit="false" autoLengths="true" margin="true" sameLengthBar="false" bearerBar="false"/>';
        xml += '  <barcode:qrcodeStyle model="2" eccLevel="15%" cellSize="1.6pt" mbcs="auto" joint="1" version="auto"/>';
        xml += '  <pt:data>' + bitlyLink.url + '</pt:data>';
        xml += '</barcode:barcode>';
        
        // SKU
        xml += '<text:text>';
        xml += '  <pt:objectStyle x="84.4pt" y="6.4pt" width="26.3pt" height="73.7pt" backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN" angle="270" anchor="TOPLEFT" flip="NONE">';
        xml += '    <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#000000" printColorNumber="1"/>';
        xml += '    <pt:brush style="NULL" color="#000000" printColorNumber="1" id="0"/>';
        xml += '    <pt:expanded objectName="Text1" ID="0" lock="0" templateMergeTarget="LABELLIST" templateMergeType="NONE" templateMergeID="0" linkStatus="NONE" linkID="0"/>';
        xml += '  </pt:objectStyle>';
        xml += '  <text:ptFontInfo>';
        xml += '    <text:logFontname="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
        xml += '    <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="9pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
        xml += '  </text:ptFontInfo>';
        xml += '  <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="true" avoidImage="false"/>';
        xml += '  <text:textAlign horizontalAlignment="JUSTIFY" verticalAlignment="CENTER" inLineAlignment="CENTER"/>';
        xml += '  <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="9pt" combinedChars="false"/>';
        xml += '  <pt:data>' + sku + '</pt:data>';
        xml += '  <text:stringItem charLen="1">';
        xml += '    <text:ptFontInfo>';
        xml += '      <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
        xml += '      <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="9pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
        xml += '    </text:ptFontInfo>';
        xml += '  </text:stringItem>';
        xml += '  <text:stringItem charLen="1">';
        xml += '    <text:ptFontInfo>';
        xml += '      <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
        xml += '      <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="9pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
        xml += '    </text:ptFontInfo>';
        xml += '  </text:stringItem>';
        xml += '  <text:stringItem charLen="1">';
        xml += '    <text:ptFontInfo>';
        xml += '      <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
        xml += '      <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="9pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
        xml += '    </text:ptFontInfo>';
        xml += '  </text:stringItem>';
        xml += '  <text:stringItem charLen="5">';
        xml += '    <text:ptFontInfo>';
        xml += '      <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
        xml += '      <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="9pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
        xml += '    </text:ptFontInfo>';
        xml += '  </text:stringItem>';
        xml += '</text:text>';
        
        // Closeup
        xml += '</pt:objects></style:sheet></pt:body></pt:document>';

        // prop.xml
        const prop = '';
        prop += '<?xml version="1.0" encoding="UTF-8"?>';
        prop += '<meta:properties xmlns:meta="' + schemaUrl + 'meta" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">';
        prop += '  <meta:appName>P-touch Editor</meta:appName>';
        prop += '  <dc:title></dc:title>';
        prop += '  <dc:subject></dc:subject>';
        prop += '  <dc:creator>Jan</dc:creator>';
        prop += '  <meta:keyword></meta:keyword>';
        prop += '  <dc:description></dc:description>';
        prop += '  <meta:template></meta:template>';
        prop += '  <dcterms:created>2018-11-16T09:21:02Z</dcterms:created><dcterms:modified>2019-02-23T14:21:35Z</dcterms:modified>';
        prop += '  <meta:lastPrinted>2019-02-22T15:20:14Z</meta:lastPrinted>';
        prop += '  <meta:modifiedBy>Jan</meta:modifiedBy>';
        prop += '  <meta:revision>8</meta:revision>';
        prop += '  <meta:editTime>554</meta:editTime>';
        prop += '  <meta:numPages>1</meta:numPages>';
        prop += '  <meta:numWords>0</meta:numWords>';
        prop += '  <meta:numChars>0</meta:numChars>';
        prop += '  <meta:security>0</meta:security>';
        prop += '</meta:properties>';
        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-disposition': 'attachment; filename=label.lbx'
        });
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.pipe(res);

        archive.append(xml, { name: 'label.xml' });
        archive.append(prop, { name: 'prop.xml' });
        archive.file(__dirname + '/../brother_labels/' + logo, { name: logo });
        archive.finalize();
        cb();
    });
};
exports.send = send;
