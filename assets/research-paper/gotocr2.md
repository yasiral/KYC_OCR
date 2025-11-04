the matching cost by performing two-pass aggregation using two orthogonal 1D windows , [6], [8]. The two-pass method first aggregates matching costs in the vertical direction, and then computes a weighted sum of the aggregated costs in the horizontal direction. Given that support regions are of size \(\omega \times \omega\), the two-pass method reduces the complexity of cost aggregation from \(\mathcal{O}\left(\omega^{2}\right)\) to \(\mathcal{O}\left(\omega\right)\).
\section*{B. Temporal cost aggregation}
Once aggregated costs \(C(p, p)\) have been computed for all pixels \(p\) in the reference image and their respective matching candidates \(p\) in the target image, a single-pass temporal aggregation routine is executed. At each time instance, the algorithm stores an auxiliary cost \(C_{a}(p, p)\) which holds a weighted summation of costs obtained in the previous frames. During temporal aggregation, the auxiliary cost is merged with the cost obtained from the current frame using
\[
\begin{array}{l}
C(p, p) \leftarrow \frac{(1-\lambda) \cdot C(p, p)+\lambda \cdot w_{i}(p, p_{L+1}) \cdot C_{a}(p, p)}{(1-\lambda)+\lambda \cdot w_{i}(p, p_{L+1})}, \\
\text { where the feedback coefficient } \lambda \text { controls the amount of cost } \\
\text { smoothing and } w_{i}(p, p_{L+1}) \text { enforces color similarity in the } \\
\text { temporal domain. The temporal adaptive weight computed } \\
\text { between the pixel of interest } p \text { in the current frame and pixel } \\
p_{L+1} \text {, located at the same spatial coordinate in the prior frame, } \\
\text { is given by } \\
w_{i}(p, p_{L+1})=\exp \left(-\frac{\Delta_{s}(p, p_{L+1})}{\gamma_{t}}\right),
\end{array}
\]
where \(\gamma_{t}\) regulates the strength of grouping by color similarity in the temporal dimension. The temporal adaptive weight has the effect of preserving edges in the temporal domain, such that when a pixel coordinate transitions from one side of an edge to another in subsequent frames, the auxiliary cost is assigned a small weight and the majority of the cost is derived from the current frame.
\section*{C. Disparity Selection and Confidence Assessment}
Having performed temporal cost aggregation, matches are determined using the Winner-Takes-All (WTA) match selection criteria. The match for \(p\), denoted as \(m(p)\), is the candidize pixel \(p \in S_{p}\) characterized by the minimum matching cost, and is given by
\[
\begin{array}{l}
m(p)=\underset{p \in S_{p}}{\operatorname{argmin}} C(p, p) \cdot \\
\text { To assess the level of confidence associated with selecting } \\
\text { minimum cost matches, the algorithm determines another set } \\
\text { of matches, this time from the target to reference image, and } \\
\text { verifies if the results agree. Given that } p=m(p), \text { i.e. pixel } p \\
\text { in the right image is the match for pixel } p \text { in the left image, } \\
\text { and } p^{\prime}=m(p) \text {, the confidence measure } F_{p} \text { is computed as }
\end{array}
\]

\[
\begin{array}{l}
F_{p}=\left\{\begin{array}{ll}
\min _{p \in S_{p} \text { min }} C(p, p)-\min _{p \in S_{p}} C(p, p) \\
\text { pc } S_{p} \text { min }(C(p, p) \\
\text { pc } S_{p} \text { min }(G(p, p) \\
\text { otherwise }
\end{array}, \quad \text { } \left|d_{p}-d_{p^{\prime}}\right| \leq 1 \\
0, \quad \text { otherwise }
\end{array}
\]
D. Iterative Disparity Refinement
Once the first iteration of stereo matching is complete, disparity estimates \(D_{p}^{x}\) can be used to guide matching in subsequent iterations. This is done by penalizing disparities that deviate from their expected values. The penalty function is given by
\[
\begin{array}{c}
\Lambda^{i}(p, p)=\alpha \times \sum_{q \in S_{p}} w(p, q) F_{q}^{-1}\left|D_{q}^{x-1}-d_{p}\right|, \\
\pi C S_{p}
\end{array}
\]
where the value of \(\alpha\) is chosen empirically. Next, the penalty values are incorporated into the matching cost as
\[
C^{t}(p, p)=C^{0}(p, p)+\Lambda^{i}(p, p)
\]
and the matches are reselected using the WTA match selection criteria. The resulting disparity maps are then post-processed using a combination of median filtering and occlusion filling. Finally, the current cost becomes the auxiliary cost for the next pair of frames in the video sequence, i.e., \(C_{a}(p, p) \leftarrow C(p, p)\) for all pixels \(p\) in the and their matching candidates \(p\).
\section*{IV. RESULTS}
The speed and accuracy of real-time stereo matching al- between the pixel of interest \(p\) in the current frame and pixel gaps from the Middlebury stereo benchmark [1, . Still frames, however, are insufficient for evaluating stereo matching algorithms that incorporate frame-to-frame prediction to enhance matching accuracy. An alternative approach is to use a stereo video sequence with a ground truth disparity for each frame. Obtaining the ground truth disparity of real world video sequences is a difficult undertaking due to the high frame rate of video and limitations in depth sensing technology. To address the need for stereo video with ground truth disparities, five pairs of synthetic stereo video sequences of a computer-generated scene were given in . While these videos incorporate a sufficient amount of movement variation, they were generated from relatively simple models using lowresolution rendering, and they do not provide occlusion or dissection of the video.
To evaluate the performance of temporal aggregation, a new synthetic stereo video sequence is introduced along with corresponding disparity maps, occlusion maps, and discontinuity maps for evaluating the performance of temporal stereo matching algorithms. To create the video sequence, a complex scene was constructed using Google Sketchup and a pair of animated paths were rendered photorealistically using the Kerkythea rendering software. Realistic material properties were used to give surfaces a natural-looking appearance by adjusting their specularity, reflectance, and diffusion. The video sequence has a resolution of \(640 \times 480\) pixels, a frame rate of 30 frames per second, and a duration of 4 seconds. In addition to performing photorealistic rendering, depth renders of both video sequences were also generated and converted to ground truth disparity for the stereo video. The video sequences and ground truth data have been made avail- able at http://mc2.un1.edu/current-research / image-processing/. Figure 2 shows two sample frames
