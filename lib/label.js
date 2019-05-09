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
    const logo = 'Object0.bmp';

    shorturl(link, function(error, bitlyLink) {
        // label.xml
        var label = brother_label(bitlyLink.url, sku);
        // prop.xml
        var prop = brother_prop();

        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-disposition': 'attachment; filename=label.lbx'
        });
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.pipe(res);

        archive.append(label, { name: 'label.xml' });
        archive.append(prop, { name: 'prop.xml' });
        archive.file(__dirname + '/../brother_labels/' + logo, { name: logo });
        archive.finalize();
        cb();
    });
};
exports.send = send;



var brother_prop = function() {
    const schemaUrl = 'http://schemas.brother.info/ptouch/2007/lbx/';
    var prop = '';
    prop += '<?xml version="1.0" encoding="UTF-8"?>';
    prop += '<meta:properties xmlns:meta="' + schemaUrl + 'meta" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">';
    prop += '  <meta:appName>P-touch Editor</meta:appName>';
    prop += '  <dc:title></dc:title>';
    prop += '  <dc:subject></dc:subject>';
    prop += '  <dc:creator>ShopOfThings.ch</dc:creator>';
    prop += '  <meta:keyword></meta:keyword>';
    prop += '  <dc:description></dc:description>';
    prop += '  <meta:template></meta:template>';
    prop += '  <dcterms:created>2018-11-16T09:21:02Z</dcterms:created><dcterms:modified>2019-02-23T14:21:35Z</dcterms:modified>';
    prop += '  <meta:lastPrinted>2019-02-22T15:20:14Z</meta:lastPrinted>';
    prop += '  <meta:modifiedBy>ShopOfThings.ch</meta:modifiedBy>';
    prop += '  <meta:revision>0</meta:revision>';
    prop += '  <meta:editTime>0</meta:editTime>';
    prop += '  <meta:numPages>1</meta:numPages>';
    prop += '  <meta:numWords>0</meta:numWords>';
    prop += '  <meta:numChars>0</meta:numChars>';
    prop += '  <meta:security>0</meta:security>';
    prop += '</meta:properties>';
    return prop;
};


var brother_label = function(urlQrcode, sku) {
    const logo = 'Object0.bmp';
    const schemaUrl = 'http://schemas.brother.info/ptouch/2007/lbx/';
    var xml = '';
    var margin = { left: 4.3, top: 8.4, right: 4.4, bottom: 8.5 };
    var paper = { height: 91, width: 107.8 };
    xml += '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '  <pt:document xmlns:pt="' + schemaUrl + 'main" xmlns:style="' + schemaUrl + 'style" xmlns:text="' + schemaUrl + 'text"';
    xml += '      xmlns:draw="' + schemaUrl + 'draw" xmlns:image="' + schemaUrl + 'image" xmlns:barcode="' + schemaUrl + 'barcode" xmlns:database="' + schemaUrl + 'database" xmlns:table="' + schemaUrl + 'table"';
    xml += '      xmlns:cable="' + schemaUrl + 'cable" version="1.5" generator="P-touch Editor 5.2.014 Windows">';
    xml += '  <pt:body currentSheet="Sheet 1" direction="LTR">';
    xml += '    <style:sheet name="Sheet 1">';
    xml += '      <style:paper media="0" width="' + paper.width + 'pt" height="' + paper.height + 'pt" marginLeft="' + margin.left + 'pt" marginTop="' + margin.top + 'pt" marginRight="' + margin.right + 'pt" marginBottom="' + margin.bottom + 'pt" orientation="portrait" autoLength="false" monochromeDisplay="true" printColorDisplay="false" printColorsID="0" paperColor="#FFFFFF" paperInk="#000000" split="1" format="264" backgroundTheme="0" printerID="14388" printerName="Brother QL-800"/>';
    xml += '      <style:cutLine regularCut="0pt" freeCut=""/>';
    xml += '      <style:backGround x="4.3pt" y="8.4pt" width="99.2pt" height="74.2pt" brushStyle="NULL" brushId="0" userPattern="NONE" userPatternId="0" color="#000000" printColorNumber="1" backColor="#FFFFFF" backPrintColorNumber="0"/>';
    xml += '      <pt:objects>';

    // Image: Logo
    xml += brother_image(logo, margin.left, margin.top, paper.width - margin.left - margin.right, 20);
    // Text: Product Page
    xml += brother_text('Product Page', { x: margin.left, y: paper.height - margin.bottom - 10, w: paper.width - margin.left - margin.right, h: 10, fontSize: 10.5, align: 'CENTER' });
    // Barcode
    xml += brother_qr(urlQrcode, 32.3, 26.4);
    // SKU
    xml += brother_text(sku, { x: paper.width - margin.right - 20, y: margin.top, w: 20, h: paper.height - margin.bottom - margin.top, fontSize: 9, angle: 270 });
    // Closeup
    xml += '</pt:objects></style:sheet></pt:body></pt:document>';
    return xml;
};



var brother_image = function(image, x, y, w, h) {
    // Image: Logo
    var xml = '';
    xml += '<image:image>';
    xml += '  <pt:objectStyle x="' + x + '" y="' + y + 'pt" width="' + w + 'pt" height="' + h + 'pt" backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN" angle="0" anchor="TOPLEFT" flip="NONE">';
    xml += '    <pt:expanded objectName="Image5" ID="0" lock="2" templateMergeTarget="LABELLIST" templateMergeType="NONE" templateMergeID="0" linkStatus="NONE" linkID="0"/>';
    xml += '  </pt:objectStyle>';
    xml += '  <image:imageStyle alignInText="LEFT" firstMerge="true" fileName="' + image + '">';
    xml += '    <image:transparent flag="false" color="#FFFFFF"/>';
    xml += '    <image:trimming flag="false" shape="RECTANGLE" trimOrgX="' + x + 'pt" trimOrgY="' + y + 'pt" trimOrgWidth="' + w + 'pt" trimOrgHeight="' + h + 'pt"/>';
    xml += '    <image:orgPos x="' + x + 'pt" y="' + y + 'pt" width="' + w + 'pt" height="' + h + 'pt"/>';
    xml += '    <image:effect effect="NONE" brightness="50" contrast="50" photoIndex="4"/>';
    xml += '    <image:mono operationKind="BINARY" reverse="0" ditherKind="MESH" threshold="128" gamma="100" ditherEdge="0" rgbconvProportionRed="30" rgbconvProportionGreen="59" rgbconvProportionBlue="11" rgbconvProportionReversed="0"/>';
    xml += '  </image:imageStyle>';
    xml += '</image:image>';
    return xml;
};


var brother_qr = function(link, x, y) {
    var xml = '';
    xml += '<barcode:barcode>';
    xml += '  <pt:objectStyle x="' + x + 'pt" y="' + y + 'pt" width="41.8pt" height="41.8pt" backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN" angle="0" anchor="TOPLEFT" flip="NONE">';
    xml += '    <pt:expanded objectName="QR" ID="0" lock="2" templateMergeTarget="LABELLIST" templateMergeType="NONE" templateMergeID="0" linkStatus="NONE" linkID="0"/>';
    xml += '  </pt:objectStyle>';
    xml += '  <barcode:barcodeStyle protocol="QRCODE" lengths="48" zeroFill="false" barWidth="1.2pt" barRatio="1:3" humanReadable="true" humanReadableAlignment="LEFT" checkDigit="false" autoLengths="true" margin="true" sameLengthBar="false" bearerBar="false"/>';
    xml += '  <barcode:qrcodeStyle model="2" eccLevel="15%" cellSize="1.6pt" mbcs="auto" joint="1" version="auto"/>';
    xml += '  <pt:data>' + link + '</pt:data>';
    xml += '</barcode:barcode>';
    return xml;
};

var brother_text = function(text, params) {
    if (params.x == undefined) { params.x = 0 };
    if (params.y == undefined) { params.y = 0 };
    if (params.w == undefined) { params.w = 0 };
    if (params.h == undefined) { params.h = 0 };
    if (params.fontSize == undefined) { params.fontSize = 10 };
    if (params.angle == undefined) { params.angle = 0 };
    if (params.align == undefined) { params.align = 'LEFT' };
    var xml = '';
    xml += '<text:text>';
    xml += '  <pt:objectStyle x="' + params.x + 'pt" y="' + params.y + 'pt" width="' + params.w + 'pt" height="' + params.h + 'pt" backColor="#FFFFFF" backPrintColorNumber="0" ropMode="COPYPEN" angle="' + params.angle + '" anchor="TOPLEFT" flip="NONE">';
    xml += '    <pt:pen style="NULL" widthX="0.5pt" widthY="0.5pt" color="#000000" printColorNumber="1"/>';
    xml += '    <pt:brush style="NULL" color="#000000" printColorNumber="1" id="0"/>';
    xml += '    <pt:expanded objectName="Text3" ID="0" lock="0" templateMergeTarget="LABELLIST" templateMergeType="NONE" templateMergeID="0" linkStatus="NONE" linkID="0"/>';
    xml += '  </pt:objectStyle>';
    xml += '  <text:ptFontInfo>';
    xml += '    <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
    xml += '    <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="' + params.fontSize + 'pt" orgSize="28.8pt" textColor="#000000" textPrintColorNumber="1"/>';
    xml += '  </text:ptFontInfo>';
    xml += '  <text:textControl control="LONGTEXTFIXED" clipFrame="false" aspectNormal="true" shrink="true" autoLF="true" avoidImage="false"/>';
    xml += '  <text:textAlign horizontalAlignment="' + params.align + '" verticalAlignment="CENTER" inLineAlignment="CENTER"/>';
    xml += '  <text:textStyle vertical="false" nullBlock="false" charSpace="0" lineSpace="0" orgPoint="24pt" combinedChars="false"/>';
    xml += '  <pt:data>' + text + '</pt:data>';
    xml += '  <text:stringItem charLen="' + text.length + '">';
    xml += '    <text:ptFontInfo>';
    xml += '      <text:logFont name="Arial" width="0" italic="false" weight="700" charSet="0" pitchAndFamily="34"/>';
    xml += '      <text:fontExt effect="NOEFFECT" underline="0" strikeout="0" size="' + params.fontSize + 'pt" orgSize="' + params.fontSize + 'pt" textColor="#000000" textPrintColorNumber="1"/>';
    xml += '    </text:ptFontInfo>';
    xml += '  </text:stringItem>';
    xml += '</text:text>';
    return xml;
};
