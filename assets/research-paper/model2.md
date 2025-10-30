### B. Temporal cost aggregation  
<|ref|>text<|/ref|><|det|>[[77, 201, 490, 321]]<|/det|>
Once aggregated costs \(C(p,p)\) have been computed for all pixels \(p\) in the reference image and their respective matching candidates \(p\) in the target image, a single- pass temporal aggregation routine is executed. At each time instance, the algorithm stores an auxiliary cost \(C_{\alpha}(p,p)\) which holds a weighted summation of costs obtained in the previous frames. During temporal aggregation, the auxiliary cost is merged with the cost obtained from the current frame using  
<|ref|>equation<|/ref|><|det|>[[84, 323, 488, 359]]<|/det|>
\[C(p,p)\leftarrow \frac{(1 - \lambda)\cdot C(p,p) + \lambda\cdot w_{t}(p,p_{t - 1})\cdot C_{\alpha}(p,p)}{(1 - \lambda) + \lambda\cdot w_{t}(p,p_{t - 1})}, \quad (4)\]  
<|ref|>text<|/ref|><|det|>[[77, 360, 490, 451]]<|/det|>
where the feedback coefficient \(\lambda\) controls the amount of cost smoothing and \(w_{t}(p,p_{t - 1})\) enforces color similarity in the temporal domain. The temporal adaptive weight computed between the pixel of interest \(p\) in the current frame and pixel \(p_{t - 1}\) , located at the same spatial coordinate in the prior frame, is given by  
<|ref|>equation<|/ref|><|det|>[[163, 453, 488, 488]]<|/det|>
\[w_{t}(p,p_{t - 1}) = \exp \left(-\frac{\Delta_{c}(p,p_{t - 1})}{\gamma_{t}}\right), \quad (5)\]  
<|ref|>text<|/ref|><|det|>[[77, 490, 490, 595]]<|/det|>
where \(\gamma_{t}\) regulates the strength of grouping by color similarity in the temporal dimension. The temporal adaptive weight has the effect of preserving edges in the temporal domain, such that when a pixel coordinate transitions from one side of an edge to another in subsequent frames, the auxiliary cost is assigned a small weight and the majority of the cost is derived from the current frame.  
<|ref|>sub_title<|/ref|><|det|>[[77, 601, 421, 616]]<|/det|>
### C. Disparity Selection and Confidence Assessment  
<|ref|>text<|/ref|><|det|>[[77, 620, 490, 695]]<|/det|>
Having performed temporal cost aggregation, matches are determined using the Winner- Takes- All (WTA) match selection criteria. The match for \(p\) , denoted as \(m(p)\) , is the candidate pixel \(p \in S_{p}\) characterized by the minimum matching cost, and is given by  
<|ref|>equation<|/ref|><|det|>[[198, 700, 488, 728]]<|/det|>
\[m(p) = \underset {p\in S_{p}}{\operatorname{argmin}}C(p,p). \quad (6)\]  
<|ref|>text<|/ref|><|det|>[[77, 732, 490, 823]]<|/det|>
To asses the level of confidence associated with selecting minimum cost matches, the algorithm determines another set of matches, this time from the target to reference image, and verifies if the results agree. Given that \(p = m(p)\) , i.e. pixel \(p\) in the right image is the match for pixel \(p\) in the left image, and \(p' = m(p)\) , the confidence measure \(F_{p}\) is computed as  
<|ref|>equation<|/ref|><|det|>[[84, 836, 488, 905]]<|/det|>
\[F_{p} = \left\{ \begin{array}{ll}\frac{\min C(p,p) - \min C(p,p)}{\mathrm{pc}S_{p}\backslash\mathrm{m}(p)}, & |d_{p} - d_{p^{\prime}}|\leq 1\\ \frac{\min C(p,p)}{\mathrm{pc}S_{p}\backslash\mathrm{m}(p)} & \mathrm{otherwise} \end{array} \right., \quad (7)\]  
<|ref|>sub_title<|/ref|><|det|>[[506, 70, 732, 85]]<|/det|>
### D. Iterative Disparity Refinement  
<|ref|>text<|/ref|><|det|>[[506, 89, 919, 163]]<|/det|>
Once the first iteration of stereo matching is complete, disparity estimates \(D_{p}^{k}\) can be used to guide matching in subsequent iterations. This is done by penalizing disparities that deviate from their expected values. The penalty function is given by  
<|ref|>equation<|/ref|><|det|>[[555, 167, 917, 202]]<|/det|>
\[\Lambda^{i}(p,p) = \alpha \times \sum_{q\in \Omega_{p}}w(p,q)F_{q}^{q - 1}\left|D_{q}^{q - 1} - d_{p}\right|, \quad (8)\]  
<|ref|>text<|/ref|><|det|>[[506, 208, 919, 238]]<|/det|>
where the value of \(\alpha\) is chosen empirically. Next, the penalty values are incorporated into the matching cost as  
<|ref|>equation<|/ref|><|det|>[[600, 243, 917, 262]]<|/det|>
\[C^{s}(p,p) = C^{0}(p,p) + \Lambda^{i}(p,p), \quad (9)\]  
<|ref|>text<|/ref|><|det|>[[506, 268, 919, 360]]<|/det|>
and the matches are reselected using the WTA match selection criteria. The resulting disparity maps are then post- processed using a combination of median filtering and occlusion filling. Finally, the current cost becomes the auxiliary cost for the next pair of frames in the video sequence, i.e., \(C_{\alpha}(p,p) \leftarrow C(p,p)\) for all pixels \(p\) in the and their matching candidates \(p\) .  
<|ref|>sub_title<|/ref|><|det|>[[662, 368, 760, 381]]<|/det|>
## IV. RESULTS  
<|ref|>text<|/ref|><|det|>[[506, 386, 919, 642]]<|/det|>
The speed and accuracy of real- time stereo matching algorithms are traditionally demonstrated using still- frame images from the Middlebury stereo benchmark [1], [2]. Still frames, however, are insufficient for evaluating stereo matching algorithms that incorporate frame- to- frame prediction to enhance matching accuracy. An alternative approach is to use a stereo video sequence with a ground truth disparity for each frame. Obtaining the ground truth disparity of real world video sequences is a difficult undertaking due to the high frame rate of video and limitations in depth sensing- technology. To address the need for stereo video with ground truth disparities, five pairs of synthetic stereo video sequences of a computer- generated scene were given in [19]. While these videos incorporate a sufficient amount of movement variation, they were generated from relatively simple models using low- resolution rendering, and they do not provide occlusion or discontinuity maps.  
<|ref|>text<|/ref|><|det|>[[506, 644, 919, 914]]<|/det|>
To evaluate the performance of temporal aggregation, a new synthetic stereo video sequence is introduced along with corresponding disparity maps, occlusion maps, and discontinuity maps for evaluating the performance of temporal stereo matching algorithms. To create the video sequence, a complex scene was constructed using Google Sketchup and a pair of animated paths were rendered photorealistically using the Kerkythea rendering software. Realistic material properties were used to give surfaces a natural- looking appearance by adjusting their specularity, reflectance, and diffusion. The video sequence has a resolution of \(640 \times 480\) pixels, a frame rate of 30 frames per second, and a duration of 4 seconds. In addition to performing photorealistic rendering, depth renders of both video sequences were also generated and converted to ground truth disparity for the stereo video. The video sequences and ground truth data have been made available at http://mc2. un1. edu/current- research/image- processing/. Figure 2 shows two sample frames
