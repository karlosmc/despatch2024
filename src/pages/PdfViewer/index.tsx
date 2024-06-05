

interface PdfViewerProps{
  base64Pdf:string
}

const PdfViewer = ({base64Pdf}:PdfViewerProps) => {
  return (
    <embed src={`data:application/pdf;base64,${base64Pdf}`} />
  )
}

export default PdfViewer