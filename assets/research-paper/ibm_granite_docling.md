<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Temporal Cost Aggregation and Disparity Refinement</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      margin: 40px;
      background: #fafafa;
      color: #222;
      line-height: 1.6;
    }
    h1, h2 {
      border-bottom: 2px solid #ccc;
      padding-bottom: 4px;
      margin-top: 2em;
    }
    p {
      margin: 1em 0;
    }
    .formula {
      background: #f4f4f4;
      border-left: 4px solid #007acc;
      padding: 0.8em;
      font-family: "Courier New", monospace;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    a {
      color: #007acc;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <h1>Temporal Cost Aggregation and Disparity Refinement</h1>

  <p>
    The matching cost is computed by performing <strong>two-pass aggregation</strong> using two orthogonal 1D windows [5], [6], [8]. 
    The two-pass method first aggregates matching costs in the vertical direction and then computes a weighted sum of the aggregated costs 
    in the horizontal direction. Given that support regions are of size ω × ω, the two-pass method reduces the complexity of cost aggregation 
    from O(ω²) to O(ω).
  </p>

  <h2>B. Temporal Cost Aggregation</h2>

  <p>
    Once aggregated costs C(p, p) have been computed for all pixels p in the reference image and their respective matching candidates p′ in the target image,
    a single-pass temporal aggregation routine is executed. At each time instance, the algorithm stores an auxiliary cost C<sub>a</sub>(p, p) which holds a weighted 
    summation of costs obtained in the previous frames. During temporal aggregation, the auxiliary cost is merged with the cost obtained from the current frame using:
  </p>

  <div class="formula">
    C(p, p) ← ((1 − λ) · C(p, p) + λ · w<sub>t</sub>(p, p<sub>t−1</sub>) · C<sub>a</sub>(p, p)) / ((1 − λ) + λ · w<sub>t</sub>(p, p<sub>t−1</sub>))
  </div>

  <p>
    Here, the feedback coefficient λ controls the amount of cost smoothing, and w<sub>t</sub>(p, p<sub>t−1</sub>) enforces color similarity in the temporal domain. 
    The temporal adaptive weight computed between the pixel of interest p in the current frame and pixel p<sub>t−1</sub>, located at the same spatial coordinate 
    in the prior frame, is given by:
  </p>

  <div class="formula">
    w<sub>t</sub>(p, p<sub>t−1</sub>) = exp(−Δ<sub>c</sub>(p, p<sub>t−1</sub>) / γ<sub>t</sub>)
  </div>

  <p>
    The parameter γ<sub>t</sub> regulates the strength of grouping by color similarity in the temporal dimension. 
    The temporal adaptive weight preserves edges in the temporal domain such that when a pixel coordinate transitions from one side of an edge to another 
    in subsequent frames, the auxiliary cost is assigned a small weight and most of the cost is derived from the current frame.
  </p>

  <h2>C. Disparity Selection and Confidence Assessment</h2>

  <p>
    After temporal cost aggregation, matches are determined using the <strong>Winner-Takes-All (WTA)</strong> selection criterion. 
    The match for p, denoted as m(p), is the candidate pixel p ∈ S<sub>p</sub> characterized by the minimum matching cost, and is given by:
  </p>

  <div class="formula">
    m(p) = arg min<sub>p ∈ S<sub>p</sub></sub> C(p, p)
  </div>

  <p>
    To assess confidence, another set of matches is computed from the target to reference image. 
    If p = m(p) (i.e., pixel p in the right image matches pixel p in the left image), and p′ = m(p), 
    then the confidence measure F<sub>p</sub> is given by:
  </p>

  <div class="formula">
    F<sub>p</sub> = { min<sub>p ∈ S<sub>p</sub></sub> C(p, p) − min<sub>p ∈ S<sub>p′</sub></sub> C(p, p), &nbsp;if |d<sub>p</sub> − d<sub>p′</sub>| ≤ 1; &nbsp; 0 otherwise. }
  </div>

  <h2>D. Iterative Disparity Refinement</h2>

  <p>
    Once the first iteration of stereo matching is complete, disparity estimates D<sub>p</sub><sup>i</sup> can be used to guide matching 
    in subsequent iterations by penalizing disparities that deviate from expected values. The penalty function is defined as:
  </p>

  <div class="formula">
    Λ<sup>i</sup>(p, p) = α × Σ<sub>q ∈ Ω<sub>p</sub></sub> w(p, q) · F<sub>q</sub><sup>i−1</sup> · |D<sub>q</sub><sup>i−1</sup> − d<sub>p</sub>|
  </div>

  <p>
    The value of α is chosen empirically. The penalty values are then incorporated into the matching cost as:
  </p>

  <div class="formula">
    C<sup>n</sup>(p, p) = C<sup>0</sup>(p, p) + Λ<sup>1</sup>(p, p)
  </div>

  <p>
    The matches are reselected using the WTA criteria. The resulting disparity maps are post-processed using median filtering and occlusion filling. 
    Finally, the current cost becomes the auxiliary cost for the next frame pair in the sequence, i.e., C<sub>a</sub>(p, p) ← C(p, p).
  </p>

  <h2>IV. Results</h2>

  <p>
    The speed and accuracy of real-time stereo matching algorithms are traditionally demonstrated using still-frame images from the Middlebury stereo benchmark [1], [2]. 
    However, still frames are insufficient for evaluating temporal stereo algorithms that incorporate frame-to-frame prediction to enhance accuracy. 
    An alternative approach is to use a stereo video sequence with ground truth disparity for each frame. 
    Obtaining ground truth disparity in real-world sequences is difficult due to high frame rates and limitations of depth-sensing technology.
  </p>

  <p>
    To evaluate the performance of temporal aggregation, a new synthetic stereo video sequence is introduced along with disparity maps, occlusion maps, and discontinuity maps. 
    The sequence was built in <strong>Google SketchUp</strong> and rendered photorealistically using the <strong>Kerkythea</strong> engine. 
    Realistic material properties were applied by adjusting specularity, reflectance, and diffusion.
  </p>

  <p>
    The video resolution is 640×480 pixels at 30 fps and 4 seconds duration. Depth renders of both videos were converted to ground truth disparity maps. 
    The video sequences and ground truth data are available at:
    <a href="http://mc2.unl.edu/current-research/image-processing/" target="_blank">
      http://mc2.unl.edu/current-research/image-processing/
    </a>.
  </p>

  <p>
    Figure 2 shows two sample frames from the sequence.
  </p>

</body>
</html>
