import React from "react";


export const AsbestosClassification = (type) => {
  if (type === 'nonhomo') {
    return (<div>
        <p>The examination and subsequent classification of fibres from the sample shall be carried out<br />as follows:</p>
        <ol style={{ listStyleType: 'lower-alpha' }}>
        <li>Examine the entire sample by stereo-microscope after ensuring that it is spread out to<br />a thickness of no more than approximately 3 to 5 mm, depending upon the type of<br />material.</li>
        <li>Examine the sample with a combination of low and high power stereo-microscopic<br />examination, to locate fibrous material.</li>
        <li>Extract fibrous material from the sample for identification by PLM and DS.<br />NOTES:
        <ol>
        <li>&lsquo;Trace&rsquo; analysis of a difficult non-homogeneous sample may not be possible due to the<br />presence of interfering substances.</li>
        <li>In general, it is not possible to reduce the size of a non-homogeneous sample in a<br />representative manner, without the potential of discarding the only part of the sample that<br />contains some asbestos. Otherwise the responsibility of &lsquo;reducing&rsquo; a sample should be<br />given to the client. If any small bundles of asbestos are to be taken from these samples,<br />analysed, and reported without appropriate qualifying remarks, this could lead to a false<br />impression of a high asbestos content in the sample.</li>
        </ol>
        </li>
        </ol>
      </div>);
  } else if (type === 'soil') {
    return(<div>
        <p>The examination and subsequent classification of fibres from the sample shall be carried out<br />as follows:</p>
        <ol style={{ listStyleType: 'lower-alpha' }}>
        <li>If a significant quantity of the sample contains particle sizes that exceed 10 mm in<br />dimension, screen the entire sample through a 10 mm sieve.<br />NOTE: Ensure that the sample is dry. Samples containing significant clay content can cause<br />major sub-sampling and analytical problems. Take care to ensure that hardened clay lumps<br />are reduced in size sufficiently to allow valid analysis.</li>
        <li>Examine the +10 mm fraction by eye or magnifying glass.</li>
        <li>Separate out all fibrous matter as sub-samples for later examination by stereomicroscope<br />and identification by PLM.</li>
        <li>Screen the &minus;10 mm fraction through a 2 mm sieve.</li>
        <li>Examine the &minus;10, +2 mm fraction by magnifier and/or low power stereo-microscope.</li>
        <li>Separate out all fibrous matter from the &minus;10, +2 mm fraction as sub-samples for later<br />examination by stereo-microscope and identification by PLM and DS.</li>
        <li>If the &minus;2 mm fraction is greater than approximately 30 to 60 g, reduce the size of the<br />sample by valid sub-sampling procedures referred to in the &lsquo;note&rsquo; applying to Clause<br />8.2.1.</li>
        <li>Spread out the &minus;2 mm fraction (or a reduced, valid sub-sample) to a thickness of no<br />more than approximately 1 to 3 mm.</li>
        <li>Use a combination of low and high power stereo-microscopy to examine the entire<br />&minus;2 mm fraction or reduced sample.</li>
        <li>Extract any fibre bundles or fibrous matter for later examination by stereomicroscope<br />and identification by PLM and DS.</li>
        <li>Conduct a trace analysis on the &minus;2 mm fraction or reduced sample.</li>
        <li>Weigh or measure the approximate dimensions of all asbestos-containing matter.</li>
        <li>Weigh asbestos fibre bundles. Otherwise, estimate the approximate length of each<br />asbestos fibre bundle by measuring along the curve of the bundle. Estimate the width<br />of each asbestos fibre bundle in such a way that it represents the minimum width<br />when all the attached smaller fibre bundles are compressed tightly together without<br />any air spaces in between them. In a similar way estimate the volume of asbestoscontaining<br />materials such as asbestos-cement. The weight of asbestos may be<br />estimated from knowledge of the specific weight of asbestos and asbestos-containing<br />materials.</li>
        </ol>
      </div>);
  } else if (type === 'ore') {
    return(<div>
      <p>The examination and subsequent classification of fibres from the sample shall be carried out<br />as follows:</p>
      <ol style={{ listStyleType: 'lower-alpha' }}>
      <li>Examine the entire surface of the large solid sections by a combination of the eye,<br />magnifying glass and stereo-microscope. Any fibrous matter is then extracted and<br />analysed by PLM and DS.</li>
      <li>Examine the dust, using the methods outlined in Clause 8.2.3 for soil samples.<br />NOTE: Because fibres may be found that are not classical chrysotile, amosite or crocidolite, it<br />may be necessary to obtain confirmation by other analytical techniques</li>
      </ol>
    </div>);
  } else {
      return(<div>
          <p>The examination and subsequent classification of fibres from the sample shall be carried out as follows:</p>
          <ol style={{ listStyleType: 'lower-alpha' }}>
          <li>Examine the sample or sub-sample by eye and with a low power stereo-microscope to<br />observe and record the presence and nature of any separate layers.</li>
          <li>Take sub-samples of each constituent layer of the sample.</li>
          <li>Use a low power stereo-microscope to examine each sample and sub-sample in its<br />entirety for evidence of fibres, increasing the magnification where necessary.<br />Separate out the fibre clumps.</li>
          <li>If possible, tease the fibre clumps apart using dissecting needles or tweezers and<br />visually classify the fibres into separate groups by means of colour and morphology,<br />for examination by high power stereo-microscopy and later identification by PLM and<br />DS.</li>
          </ol>
          <p><br /><em>NOTE: If the sample is large, i.e. more than about 100 g, it will usually be necessary to reduce its</em><br /><em>size to that it can be thoroughly examined. Valid sub-sampling procedures that are fully</em><br /><em>documented should be applied so as to ensure that the sub-sample to be analysed accurately</em><br /><em>represents the sample received. For example, the sample can be split into a smaller representative</em><br /><em>sample as in ISO 3082, BS EN 932-1 or BS 1337-1.</em></p>
        </div>);
      }
}
